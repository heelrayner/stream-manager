import { PrismaClient, Platform, ScheduleStatus, VodStatus } from '@prisma/client';
import EventEmitter from 'events';
import cron from 'node-cron';
import { encrypt, decrypt } from './utils/encryption';
import { logger } from './utils/logger';
import { TiktokService } from './services/tiktokService';
import { TwitchService } from './services/twitchService';
import { YoutubeService } from './services/youtubeService';
import { KickService } from './services/kickService';
import { FacebookService } from './services/facebookService';
import type {
  PlatformClient,
  ShortFormSchedulePayload,
  StreamMetadata,
  VodUploadPayload,
} from './services/platformClient';
import { publishToTwitter, secureTwitterKey } from './social/twitterService';
import { publishToDiscord, secureDiscordWebhook } from './social/discordService';
import { publishToWebhook } from './social/genericWebhookService';

const prisma = new PrismaClient();
const alertsEmitter = new EventEmitter();

const clients: Record<Platform, PlatformClient> = {
  [Platform.TIKTOK]: new TiktokService(),
  [Platform.TWITCH]: new TwitchService(),
  [Platform.KICK]: new KickService(),
  [Platform.YOUTUBE]: new YoutubeService(),
  [Platform.FACEBOOK]: new FacebookService(),
};

function sanitizeAccountTokens(account: any) {
  const { accessToken, refreshToken, ...rest } = account;
  return rest;
}

export const backendApi = {
  async getAccounts() {
    const accounts = await prisma.account.findMany({ orderBy: { createdAt: 'desc' } });
    return accounts.map(sanitizeAccountTokens);
  },

  async connectAccount(input: {
    platform: Platform;
    accountId: string;
    displayName: string;
    accessToken: string;
    refreshToken: string;
    scopes: string[];
  }) {
    const encryptedAccess = encrypt(input.accessToken);
    const encryptedRefresh = encrypt(input.refreshToken);
    const account = await prisma.account.upsert({
      where: { accountId: input.accountId },
      update: {
        displayName: input.displayName,
        accessToken: encryptedAccess,
        refreshToken: encryptedRefresh,
        scopes: input.scopes,
        connected: true,
      },
      create: {
        platform: input.platform,
        accountId: input.accountId,
        displayName: input.displayName,
        accessToken: encryptedAccess,
        refreshToken: encryptedRefresh,
        scopes: input.scopes,
        connected: true,
      },
    });
    return sanitizeAccountTokens(account);
  },

  async disconnectAccount(accountId: number) {
    await prisma.account.update({
      where: { id: accountId },
      data: { connected: false, accessToken: encrypt(''), refreshToken: encrypt('') },
    });
    return true;
  },

  async scheduleShort(input: Omit<ShortFormSchedulePayload, 'scheduledFor'> & {
    scheduledFor: string;
    platform: Platform;
    accountId?: number;
  }) {
    const record = await prisma.shortVideoSchedule.create({
      data: {
        title: input.title,
        description: input.description,
        tags: input.tags,
        videoPath: input.videoPath,
        scheduledFor: new Date(input.scheduledFor),
        platform: input.platform,
        accountId: input.accountId,
      },
    });
    return record;
  },

  async listShortSchedules() {
    return prisma.shortVideoSchedule.findMany({ orderBy: { scheduledFor: 'asc' } });
  },

  async listVodUploads() {
    return prisma.vodUpload.findMany({ orderBy: { scheduledFor: 'asc' } });
  },

  async scheduleVod(input: Omit<VodUploadPayload, 'scheduledFor'> & { scheduledFor: string; platform: Platform; accountId?: number }) {
    return prisma.vodUpload.create({
      data: {
        title: input.title,
        description: input.description,
        tags: input.tags,
        videoPath: input.videoPath,
        scheduledFor: new Date(input.scheduledFor),
        platform: input.platform,
        accountId: input.accountId,
      },
    });
  },

  async updateStreamMetadata(metadata: StreamMetadata & { accountIds: number[] }) {
    const accounts = await prisma.account.findMany({ where: { id: { in: metadata.accountIds }, connected: true } });
    for (const account of accounts) {
      await clients[account.platform].updateStreamInfo(
        { ...account, accessToken: decrypt(account.accessToken), refreshToken: decrypt(account.refreshToken) },
        metadata,
      );
    }
    return { updated: accounts.length };
  },

  async addAlert(event: { platform: Platform; accountId?: number; type: string; payload: any }) {
    const created = await prisma.alertEvent.create({ data: event });
    alertsEmitter.emit('alert', created);
    return created;
  },

  async getAlerts() {
    return prisma.alertEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
  },

  async addHighlight(label: string, timestamp: number, note?: string) {
    return prisma.highlight.create({ data: { label, timestamp, note } });
  },

  async listHighlights() {
    return prisma.highlight.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  },

  async getSocialIntegrations() {
    return prisma.socialIntegration.findMany({ orderBy: { createdAt: 'desc' } });
  },

  async addSocialIntegration(input: {
    name: string;
    type: string;
    apiKey?: string;
    webhookUrl?: string;
    enabled?: boolean;
    config?: Record<string, unknown>;
    messageTemplate?: string;
  }) {
    const apiKey = input.apiKey ? secureTwitterKey(input.apiKey) : null;
    const webhookUrl = input.webhookUrl ? secureDiscordWebhook(input.webhookUrl) : null;
    return prisma.socialIntegration.create({
      data: {
        name: input.name,
        type: input.type,
        apiKey: apiKey || undefined,
        webhookUrl: webhookUrl || undefined,
        enabled: input.enabled ?? true,
        config: input.config,
        messageTemplate: input.messageTemplate,
      },
    });
  },

  async updateSocialIntegration(id: number, input: Partial<{ name: string; type: string; apiKey: string; webhookUrl: string; enabled: boolean; config: Record<string, unknown>; messageTemplate: string }>) {
    const data: any = { ...input };
    if (input.apiKey) data.apiKey = secureTwitterKey(input.apiKey);
    if (input.webhookUrl) data.webhookUrl = secureDiscordWebhook(input.webhookUrl);
    return prisma.socialIntegration.update({ where: { id }, data });
  },

  async deleteSocialIntegration(id: number) {
    await prisma.socialIntegration.delete({ where: { id } });
    return true;
  },
};

async function processPendingShorts() {
  const pending = await prisma.shortVideoSchedule.findMany({
    where: { status: ScheduleStatus.PENDING, scheduledFor: { lte: new Date() } },
  });
  for (const schedule of pending) {
    const account = schedule.accountId
      ? await prisma.account.findUnique({ where: { id: schedule.accountId } })
      : null;
    if (!account) {
      await prisma.shortVideoSchedule.update({ where: { id: schedule.id }, data: { status: ScheduleStatus.FAILED, resultMessage: 'Account missing' } });
      continue;
    }
    const decryptedAccount = {
      ...account,
      accessToken: decrypt(account.accessToken),
      refreshToken: decrypt(account.refreshToken),
    } as any;
    try {
      const result = await clients[account.platform].scheduleShort(decryptedAccount, {
        title: schedule.title,
        description: schedule.description,
        tags: schedule.tags,
        videoPath: schedule.videoPath,
        scheduledFor: schedule.scheduledFor,
      });
      await prisma.shortVideoSchedule.update({
        where: { id: schedule.id },
        data: { status: ScheduleStatus.POSTED, externalId: result.externalId, resultMessage: result.status },
      });
      await sendGoLiveMessages(`Short posted: ${schedule.title}`);
    } catch (error: any) {
      logger.error('Failed to process short schedule', error);
      await prisma.shortVideoSchedule.update({ where: { id: schedule.id }, data: { status: ScheduleStatus.FAILED, resultMessage: error?.message } });
    }
  }
}

async function processVodUploads() {
  const pending = await prisma.vodUpload.findMany({ where: { status: VodStatus.PENDING, scheduledFor: { lte: new Date() } } });
  for (const vod of pending) {
    const account = vod.accountId ? await prisma.account.findUnique({ where: { id: vod.accountId } }) : null;
    if (!account) {
      await prisma.vodUpload.update({ where: { id: vod.id }, data: { status: VodStatus.FAILED, resultMessage: 'Account missing' } });
      continue;
    }
    const decryptedAccount = {
      ...account,
      accessToken: decrypt(account.accessToken),
      refreshToken: decrypt(account.refreshToken),
    } as any;
    try {
      const result = await clients[account.platform].uploadVOD(decryptedAccount, {
        title: vod.title,
        description: vod.description,
        tags: vod.tags,
        videoPath: vod.videoPath,
        scheduledFor: vod.scheduledFor,
      });
      await prisma.vodUpload.update({ where: { id: vod.id }, data: { status: VodStatus.POSTED, externalId: result.externalId, resultMessage: result.status } });
    } catch (error: any) {
      logger.error('Failed to process vod upload', error);
      await prisma.vodUpload.update({ where: { id: vod.id }, data: { status: VodStatus.FAILED, resultMessage: error?.message } });
    }
  }
}

async function refreshTokensJob() {
  const accounts = await prisma.account.findMany({ where: { connected: true } });
  for (const account of accounts) {
    try {
      const result = await clients[account.platform].refreshToken({
        ...account,
        accessToken: decrypt(account.accessToken),
        refreshToken: decrypt(account.refreshToken),
      } as any);
      await prisma.account.update({
        where: { id: account.id },
        data: {
          accessToken: encrypt(result.accessToken),
          refreshToken: result.refreshToken ? encrypt(result.refreshToken) : account.refreshToken,
          scopes: result.scopes ?? account.scopes,
          lastRefreshAt: new Date(),
        },
      });
    } catch (error) {
      logger.error('Failed to refresh token', error);
    }
  }
}

async function sendGoLiveMessages(message: string) {
  const integrations = await prisma.socialIntegration.findMany({ where: { enabled: true } });
  for (const integration of integrations) {
    const rendered = integration.messageTemplate ? integration.messageTemplate.replace('{{message}}', message) : message;
    switch (integration.type) {
      case 'twitter':
        if (integration.apiKey) await publishToTwitter(integration.apiKey, { text: rendered });
        break;
      case 'discord':
        if (integration.webhookUrl) await publishToDiscord(integration.webhookUrl, { content: rendered });
        break;
      default:
        if (integration.webhookUrl) await publishToWebhook(integration.webhookUrl, { body: { text: rendered } });
        break;
    }
  }
}

function startMockAlerts() {
  setInterval(async () => {
    const account = await prisma.account.findFirst();
    if (!account) return;
    const alert = await backendApi.addAlert({
      platform: account.platform,
      accountId: account.id,
      type: 'follow',
      payload: { user: `fan-${Date.now()}` },
    });
    alertsEmitter.emit('alert', alert);
  }, 30000);
}

export async function initBackend() {
  logger.info('Starting streaman backend');
  cron.schedule('*/5 * * * *', processPendingShorts);
  cron.schedule('*/10 * * * *', refreshTokensJob);
  cron.schedule('*/15 * * * *', processVodUploads);
  startMockAlerts();
}

export { alertsEmitter };
