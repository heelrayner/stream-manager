import { PrismaClient, Account, ScheduledShort, Vod, SocialIntegration } from '@prisma/client';
import path from 'path';
import { EventEmitter } from 'events';
import cron from 'node-cron';
import { app } from 'electron';
import { encrypt, decrypt } from '../utils/encryption';
import { logger, setupLogger } from '../utils/logger';
import { PlatformClient } from './services/platformClient';
import { TwitchService } from './services/twitchService';
import { YoutubeService } from './services/youtubeService';
import { TiktokService } from './services/tiktokService';
import { KickService } from './services/kickService';
import { FacebookService } from './services/facebookService';
import { postToTwitter } from '../social/twitterService';
import { postToDiscord } from '../social/discordService';
import { postToWebhook } from '../social/genericWebhookService';

export interface ConnectAccountPayload {
  platform: string;
  externalId: string;
  displayName: string;
  accessToken: string;
  refreshToken: string;
  scopes: string[];
}

export interface ScheduleShortPayload {
  title: string;
  description: string;
  tags: string[];
  videoPath: string;
  scheduledTime: string;
  platform: string;
  accountId?: number;
}

export interface VodPayload extends ScheduleShortPayload {}

export interface MetadataPayload {
  title: string;
  category: string;
  game: string;
  accountIds: number[];
}

export class BackendApp extends EventEmitter {
  prisma: PrismaClient;
  platformClients: Record<string, PlatformClient>;

  constructor(databasePath?: string) {
    super();
    setupLogger();
    const dbPath = databasePath || path.join(app.getPath('userData'), 'streaman.db');
    process.env.DATABASE_URL = `file:${dbPath}`;
    this.prisma = new PrismaClient();
    this.platformClients = {
      TikTok: new TiktokService(),
      Twitch: new TwitchService(),
      Kick: new KickService(),
      YouTube: new YoutubeService(),
      Facebook: new FacebookService()
    };
    this.bootstrapSchedules();
    this.bootstrapTokenRefresher();
  }

  async getAccounts(): Promise<Account[]> {
    return this.prisma.account.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async connectAccount(payload: ConnectAccountPayload): Promise<Account> {
    const accessEncrypted = encrypt(payload.accessToken);
    const refreshEncrypted = encrypt(payload.refreshToken);
    const serializedAccess = JSON.stringify(accessEncrypted);
    const serializedRefresh = JSON.stringify(refreshEncrypted);
    const account = await this.prisma.account.upsert({
      where: { externalId: payload.externalId },
      update: {
        displayName: payload.displayName,
        accessToken: serializedAccess,
        refreshToken: serializedRefresh,
        scopes: payload.scopes.join(','),
        connectionStatus: 'connected',
        lastRefreshed: new Date()
      },
      create: {
        platform: payload.platform,
        externalId: payload.externalId,
        displayName: payload.displayName,
        accessToken: serializedAccess,
        refreshToken: serializedRefresh,
        scopes: payload.scopes.join(','),
        connectionStatus: 'connected',
        lastRefreshed: new Date()
      }
    });
    logger.info(`Connected account ${account.displayName} on ${account.platform}`);
    return account;
  }

  async disconnectAccount(accountId: number): Promise<void> {
    await this.prisma.account.update({
      where: { id: accountId },
      data: { connectionStatus: 'disconnected' }
    });
    logger.info(`Disconnected account ${accountId}`);
  }

  async scheduleShort(payload: ScheduleShortPayload): Promise<ScheduledShort> {
    const short = await this.prisma.scheduledShort.create({
      data: {
        title: payload.title,
        description: payload.description,
        tags: payload.tags.join(','),
        videoPath: payload.videoPath,
        scheduledTime: new Date(payload.scheduledTime),
        platform: payload.platform,
        accountId: payload.accountId ?? null
      }
    });
    logger.info(`Scheduled short ${short.title} for ${short.scheduledTime.toISOString()}`);
    return short;
  }

  async listShorts(): Promise<ScheduledShort[]> {
    return this.prisma.scheduledShort.findMany({ orderBy: { scheduledTime: 'asc' } });
  }

  async scheduleVod(payload: VodPayload): Promise<Vod> {
    const vod = await this.prisma.vod.create({
      data: {
        title: payload.title,
        description: payload.description,
        tags: payload.tags.join(','),
        videoPath: payload.videoPath,
        scheduledTime: new Date(payload.scheduledTime),
        platform: payload.platform,
        accountId: payload.accountId ?? null
      }
    });
    logger.info(`Scheduled VOD ${vod.title} for ${vod.scheduledTime.toISOString()}`);
    return vod;
  }

  async listVods(): Promise<Vod[]> {
    return this.prisma.vod.findMany({ orderBy: { scheduledTime: 'asc' } });
  }

  async updateMetadata(payload: MetadataPayload): Promise<void> {
    const metadata = await this.prisma.streamMetadataUpdate.create({
      data: {
        title: payload.title,
        category: payload.category,
        game: payload.game,
        scheduledTime: new Date(),
        accountIds: payload.accountIds.join(',')
      }
    });
    logger.info(`Queued metadata update ${metadata.id}`);
    for (const accountId of payload.accountIds) {
      const account = await this.prisma.account.findUnique({ where: { id: accountId } });
      if (account) {
        const client = this.platformClients[account.platform];
        await client?.updateStreamInfo(account.id, { title: payload.title, category: payload.category, game: payload.game });
      }
    }
  }

  async addAlert(event: { platform: string; type: string; message: string; payload: Record<string, unknown> }) {
    const alert = await this.prisma.alertEvent.create({ data: { ...event } });
    this.emit('alert', alert);
  }

  async listAlerts() {
    return this.prisma.alertEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
  }

  async listSocialIntegrations(): Promise<SocialIntegration[]> {
    return this.prisma.socialIntegration.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async saveSocialIntegration(integration: Omit<SocialIntegration, 'id' | 'createdAt' | 'updatedAt'> & { id?: number }): Promise<SocialIntegration> {
    const apiEncrypted = integration.apiKey ? JSON.stringify(encrypt(integration.apiKey)) : null;
    const webhookEncrypted = integration.webhookUrl ? JSON.stringify(encrypt(integration.webhookUrl)) : null;
    if (integration.id) {
      return this.prisma.socialIntegration.update({
        where: { id: integration.id },
        data: { ...integration, apiKey: apiEncrypted, webhookUrl: webhookEncrypted }
      });
    }
    return this.prisma.socialIntegration.create({ data: { ...integration, apiKey: apiEncrypted, webhookUrl: webhookEncrypted } });
  }

  async deleteSocialIntegration(id: number) {
    return this.prisma.socialIntegration.delete({ where: { id } });
  }

  async postGoLiveMessage(message: string) {
    const integrations = await this.listSocialIntegrations();
    for (const integration of integrations.filter((i) => i.enabled)) {
      const apiKey = integration.apiKey ? decrypt(JSON.parse(integration.apiKey)) : undefined;
      const webhook = integration.webhookUrl ? decrypt(JSON.parse(integration.webhookUrl)) : undefined;
      const template = integration.messageTemplate || message;
      if (integration.type === 'twitter') await postToTwitter(template, apiKey);
      else if (integration.type === 'discord') await postToDiscord(template, webhook);
      else await postToWebhook(template, webhook);
    }
  }

  bootstrapSchedules() {
    cron.schedule('*/1 * * * *', async () => {
      await this.processScheduledShorts();
      await this.processScheduledVods();
    });
  }

  bootstrapTokenRefresher() {
    cron.schedule('*/15 * * * *', async () => {
      const accounts = await this.prisma.account.findMany({ where: { connectionStatus: 'connected' } });
      for (const account of accounts) {
        const client = this.platformClients[account.platform];
        await client?.refreshToken(account.id);
        await this.prisma.account.update({ where: { id: account.id }, data: { lastRefreshed: new Date() } });
      }
    });
  }

  private async processScheduledShorts() {
    const now = new Date();
    const dueShorts = await this.prisma.scheduledShort.findMany({ where: { scheduledTime: { lte: now }, status: 'pending' } });
    for (const short of dueShorts) {
      const client = this.platformClients[short.platform];
      await this.prisma.scheduledShort.update({ where: { id: short.id }, data: { status: 'uploading' } });
      try {
        await client?.scheduleShort(short.accountId, {
          title: short.title,
          description: short.description,
          tags: short.tags.split(',').filter(Boolean),
          videoPath: short.videoPath,
          scheduledTime: short.scheduledTime
        });
        await this.prisma.scheduledShort.update({ where: { id: short.id }, data: { status: 'posted', resultMessage: 'Posted successfully' } });
      } catch (err) {
        logger.error(err);
        await this.prisma.scheduledShort.update({ where: { id: short.id }, data: { status: 'failed', resultMessage: 'Failed to upload' } });
      }
    }
  }

  private async processScheduledVods() {
    const now = new Date();
    const dueVods = await this.prisma.vod.findMany({ where: { scheduledTime: { lte: now }, status: 'pending' } });
    for (const vod of dueVods) {
      const client = this.platformClients[vod.platform];
      await this.prisma.vod.update({ where: { id: vod.id }, data: { status: 'uploading' } });
      try {
        await client?.uploadVOD(vod.accountId, {
          title: vod.title,
          description: vod.description,
          tags: vod.tags.split(',').filter(Boolean),
          videoPath: vod.videoPath,
          scheduledTime: vod.scheduledTime
        });
        await this.prisma.vod.update({ where: { id: vod.id }, data: { status: 'posted', resultMessage: 'Uploaded successfully' } });
      } catch (err) {
        logger.error(err);
        await this.prisma.vod.update({ where: { id: vod.id }, data: { status: 'failed', resultMessage: 'Failed to upload' } });
      }
    }
  }
}

export function createBackend() {
  const backend = new BackendApp();
  return backend;
}
