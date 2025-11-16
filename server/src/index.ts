import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { parse } from 'node:url';
import { join, normalize } from 'node:path';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { config } from './config.js';
import {
  listPlatformAccounts,
  insertPlatformAccount,
  deletePlatformAccountRecord,
  updatePlatformAccountRecord,
  listStreams,
  insertStream,
  updateStreamRecord,
  deleteStreamRecord,
  dashboardSummary,
} from './db.js';
import { encryptSecret } from './encryption.js';
import { mapAccount, mapStream } from './mappers.js';
import { DashboardSummary } from './types.js';

const publicDir = join(process.cwd(), 'dist/public');
const mimeTypes: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

function setCors(res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendJson(res: ServerResponse, status: number, data: any) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

function handleNotFound(res: ServerResponse) {
  sendJson(res, 404, { error: 'Not Found' });
}

function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req
      .on('data', (chunk) => {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      })
      .on('end', () => {
        if (!chunks.length) {
          resolve({});
          return;
        }
        try {
          const raw = Buffer.concat(chunks).toString('utf8');
          resolve(JSON.parse(raw));
        } catch (err) {
          reject(err);
        }
      })
      .on('error', reject);
  });
}

function safeJoin(base: string, target: string): string {
  const targetPath = normalize(join(base, target));
  if (!targetPath.startsWith(base)) {
    return base;
  }
  return targetPath;
}

function serveStatic(pathname: string, res: ServerResponse) {
  const cleanPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = safeJoin(publicDir, cleanPath);
  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    if (existsSync(join(publicDir, 'index.html'))) {
      const fallback = join(publicDir, 'index.html');
      res.setHeader('Content-Type', 'text/html');
      res.end(readFileSync(fallback));
      return;
    }
    handleNotFound(res);
    return;
  }
  const ext = filePath.substring(filePath.lastIndexOf('.'));
  const type = mimeTypes[ext] || 'application/octet-stream';
  res.setHeader('Content-Type', type);
  res.end(readFileSync(filePath));
}

async function handleApi(pathname: string, method: string, req: IncomingMessage, res: ServerResponse) {
  if (method === 'GET' && pathname === '/api/health') {
    sendJson(res, 200, { status: 'ok' });
    return;
  }

  if (method === 'GET' && pathname === '/api/platforms') {
    const accounts = listPlatformAccounts().map(mapAccount);
    sendJson(res, 200, accounts);
    return;
  }

  if (method === 'POST' && pathname === '/api/platforms') {
    const body = await parseBody(req);
    if (!body.platform || !body.username || !body.apiKey) {
      sendJson(res, 400, { error: 'platform, username, and apiKey are required' });
      return;
    }
    const encrypted = encryptSecret(String(body.apiKey), config.encryptionKey);
    const record = insertPlatformAccount({
      platform: body.platform,
      username: body.username,
      api_key_encrypted: encrypted,
      notes: body.notes || null,
    });
    sendJson(res, 201, mapAccount(record));
    return;
  }

  const platformMatch = pathname.match(/^\/api\/platforms\/(\d+)$/);
  if (platformMatch) {
    const id = Number(platformMatch[1]);
    if (method === 'DELETE') {
      deletePlatformAccountRecord(id);
      sendJson(res, 204, {});
      return;
    }
    if (method === 'PUT') {
      const body = await parseBody(req);
      const update: any = {};
      if (body.platform) update.platform = body.platform;
      if (body.username) update.username = body.username;
      if (body.notes !== undefined) update.notes = body.notes;
      if (body.apiKey) {
        update.api_key_encrypted = encryptSecret(String(body.apiKey), config.encryptionKey);
      }
      const updated = updatePlatformAccountRecord(id, update);
      if (!updated) {
        handleNotFound(res);
        return;
      }
      sendJson(res, 200, mapAccount(updated));
      return;
    }
  }

  if (method === 'GET' && pathname === '/api/streams') {
    const streams = listStreams().map(mapStream);
    sendJson(res, 200, streams);
    return;
  }

  if (method === 'POST' && pathname === '/api/streams') {
    const body = await parseBody(req);
    if (!body.title || !body.platform || !body.contentType || !body.status) {
      sendJson(res, 400, { error: 'title, platform, contentType, and status are required' });
      return;
    }
    const record = insertStream({
      title: body.title,
      platform: body.platform,
      content_type: body.contentType,
      status: body.status,
      scheduled_at: body.scheduledAt || null,
      duration_minutes: body.durationMinutes ?? null,
      notes: body.notes || null,
      account_id: body.accountId ?? null,
    });
    sendJson(res, 201, mapStream(record));
    return;
  }

  const streamMatch = pathname.match(/^\/api\/streams\/(\d+)$/);
  if (streamMatch) {
    const id = Number(streamMatch[1]);
    if (method === 'PUT') {
      const body = await parseBody(req);
      const updated = updateStreamRecord(id, {
        title: body.title,
        platform: body.platform,
        content_type: body.contentType,
        status: body.status,
        scheduled_at: body.scheduledAt ?? null,
        duration_minutes: body.durationMinutes ?? null,
        notes: body.notes ?? null,
        account_id: body.accountId ?? null,
      });
      if (!updated) {
        handleNotFound(res);
        return;
      }
      sendJson(res, 200, mapStream(updated));
      return;
    }
    if (method === 'DELETE') {
      deleteStreamRecord(id);
      sendJson(res, 204, {});
      return;
    }
  }

  const statusMatch = pathname.match(/^\/api\/streams\/(\d+)\/status$/);
  if (statusMatch && method === 'PATCH') {
    const id = Number(statusMatch[1]);
    const body = await parseBody(req);
    if (!body.status) {
      sendJson(res, 400, { error: 'status is required' });
      return;
    }
    const updated = updateStreamRecord(id, { status: body.status });
    if (!updated) {
      handleNotFound(res);
      return;
    }
    sendJson(res, 200, mapStream(updated));
    return;
  }

  if (method === 'GET' && pathname === '/api/dashboard') {
    const summary: DashboardSummary = dashboardSummary();
    sendJson(res, 200, summary);
    return;
  }

  handleNotFound(res);
}

const server = createServer(async (req, res) => {
  setCors(res);
  if (!req.url) {
    handleNotFound(res);
    return;
  }
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  const { pathname } = parse(req.url, true);
  const method = req.method || 'GET';
  if (pathname && pathname.startsWith('/api/')) {
    try {
      await handleApi(pathname, method, req, res);
    } catch (err) {
      console.error(err);
      sendJson(res, 500, { error: 'Internal Server Error' });
    }
    return;
  }
  if (pathname) {
    serveStatic(pathname, res);
    return;
  }
  handleNotFound(res);
});

server.listen(config.port, () => {
  console.log(`Stream Manager API listening on http://localhost:${config.port}`);
});
