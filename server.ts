import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type StoredStage = 'hub' | 'cpf_verified' | 'account_verification';

interface IpSessionRecord {
  ip: string;
  protocolCode: string;
  stage: StoredStage;
  startedAt: string;
  cpfVerifiedAt?: string;
  photoSubmittedAt?: string;
  updatedAt: string;
}

const DATA_DIR = path.resolve(__dirname, '.data');
const SESSIONS_FILE = path.join(DATA_DIR, 'ip_sessions.json');

function loadSessionsFromDisk(): Map<string, IpSessionRecord> {
  const map = new Map<string, IpSessionRecord>();
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as Record<string, IpSessionRecord>;
      for (const [key, value] of Object.entries(parsed)) {
        map.set(key, {
          ip: value.ip,
          protocolCode: value.protocolCode,
          stage: value.stage,
          startedAt: value.startedAt,
          cpfVerifiedAt: value.cpfVerifiedAt,
          photoSubmittedAt: value.photoSubmittedAt,
          updatedAt: value.updatedAt,
        });
      }
    }
  } catch {
    // Start fresh if file is unreadable
  }
  return map;
}

function persistSessionsToDisk(map: Map<string, IpSessionRecord>): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const obj: Record<string, IpSessionRecord> = {};
    for (const [key, value] of map.entries()) {
      obj[key] = value;
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch {
    // Non-fatal persistence fallback
  }
}

const sessions = loadSessionsFromDisk();

function getClientIp(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim().length > 0) {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim();
  }
  const rawIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
  return rawIp.replace(/^::ffff:/, '');
}

function maskIpForDisplay(ip: string): string {
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.***.${parts[3]}`;
    }
  }
  if (ip.includes(':')) {
    const parts = ip.split(':').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}:****`;
    }
  }
  return ip;
}

function isValidCpfDigits(cpfInput: string): boolean {
  const digits = cpfInput.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(digits[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== Number(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += Number(digits[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== Number(digits[10])) return false;

  return true;
}

function generateProtocolCode(): string {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `IV-${randomDigits}`;
}

async function startServer() {
  const app = express();
  app.set('trust proxy', true);
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/session', (req, res) => {
    const ip = getClientIp(req);
    const existing = sessions.get(ip);

    if (!existing) {
      const fresh: IpSessionRecord = {
        ip,
        protocolCode: generateProtocolCode(),
        stage: 'hub',
        startedAt: new Date().toLocaleString('pt-BR'),
        updatedAt: new Date().toISOString(),
      };
      sessions.set(ip, fresh);
      persistSessionsToDisk(sessions);

      res.json({
        ipMasked: maskIpForDisplay(ip),
        protocolCode: fresh.protocolCode,
        stage: fresh.stage,
        startedAt: fresh.startedAt,
      });
      return;
    }

    res.json({
      ipMasked: maskIpForDisplay(ip),
      protocolCode: existing.protocolCode,
      stage: existing.stage,
      startedAt: existing.startedAt,
      cpfVerifiedAt: existing.cpfVerifiedAt,
      photoSubmittedAt: existing.photoSubmittedAt,
    });
  });

  app.post('/api/session/cpf', (req, res) => {
    const ip = getClientIp(req);
    const body = req.body as { cpf?: string } | undefined;
    const cpf = typeof body?.cpf === 'string' ? body.cpf : '';

    if (!isValidCpfDigits(cpf)) {
      res.status(400).json({
        error: 'CPF inválido. Informe um CPF válido com 11 dígitos.',
      });
      return;
    }

    // CPF is validated only in transit and never stored
    const existing = sessions.get(ip);
    const nowFormatted = new Date().toLocaleString('pt-BR');
    const record: IpSessionRecord = {
      ip,
      protocolCode: existing?.protocolCode ?? generateProtocolCode(),
      stage:
        existing?.stage === 'account_verification'
          ? 'account_verification'
          : 'cpf_verified',
      startedAt: existing?.startedAt ?? nowFormatted,
      cpfVerifiedAt: nowFormatted,
      photoSubmittedAt: existing?.photoSubmittedAt,
      updatedAt: new Date().toISOString(),
    };

    sessions.set(ip, record);
    persistSessionsToDisk(sessions);

    res.json({
      ipMasked: maskIpForDisplay(ip),
      protocolCode: record.protocolCode,
      stage: record.stage,
      cpfVerifiedAt: record.cpfVerifiedAt,
    });
  });

  app.post('/api/session/photo', (req, res) => {
    const ip = getClientIp(req);
    const existing = sessions.get(ip);
    const nowFormatted = new Date().toLocaleString('pt-BR');

    // Only IP and step status are stored; photo image is never persisted
    const record: IpSessionRecord = {
      ip,
      protocolCode: existing?.protocolCode ?? generateProtocolCode(),
      stage: 'account_verification',
      startedAt: existing?.startedAt ?? nowFormatted,
      cpfVerifiedAt: existing?.cpfVerifiedAt,
      photoSubmittedAt: nowFormatted,
      updatedAt: new Date().toISOString(),
    };

    sessions.set(ip, record);
    persistSessionsToDisk(sessions);

    res.json({
      ipMasked: maskIpForDisplay(ip),
      protocolCode: record.protocolCode,
      stage: record.stage,
      photoSubmittedAt: record.photoSubmittedAt,
    });
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Identity Verification server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
