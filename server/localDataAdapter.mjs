import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, rename, rm, stat, unlink, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14;
const RESET_TTL_MS = 1000 * 60 * 30;

const EMPTY_EVENT_SESSION = {
  messages: [],
  eventSummary: '',
};

function nowIso() {
  return new Date().toISOString();
}

function hashSecret(value) {
  return createHash('sha256').update(String(value)).digest('hex');
}

function scryptPassword(password, salt = randomBytes(16).toString('hex')) {
  const derivedKey = scryptSync(password, salt, 64).toString('hex');
  return {
    salt,
    hash: derivedKey,
  };
}

function verifyPassword(password, salt, expectedHash) {
  const next = scryptSync(password, salt, 64);
  const current = Buffer.from(expectedHash, 'hex');
  return current.length === next.length && timingSafeEqual(current, next);
}

function ensureDbShape(raw = {}) {
  return {
    version: 1,
    users: Array.isArray(raw.users) ? raw.users : [],
    sessions: Array.isArray(raw.sessions) ? raw.sessions : [],
  };
}

function sanitizeUser(user) {
  const displayName =
    user.profile?.name?.trim() ||
    user.displayName ||
    String(user.email ?? 'WeaR user').split('@')[0] ||
    'WeaR user';

  return {
    id: user.id,
    email: user.email,
    name: displayName,
    onboarded: Boolean(user.onboarded),
    createdAt: user.createdAt,
    importedLegacyData: Boolean(user.importedLegacyData),
  };
}

function buildMediaResponse(asset) {
  return {
    id: asset.id,
    ownerUserId: asset.ownerUserId,
    kind: asset.kind,
    createdAt: asset.createdAt,
    fileName: asset.fileName,
    mimeType: asset.mimeType,
    sizeBytes: asset.sizeBytes,
    linkedItemId: asset.linkedItemId ?? null,
    previewUrl: `/api/media/${asset.id}/content?variant=preview`,
    originalUrl: `/api/media/${asset.id}/content`,
  };
}

function parseDataUrl(dataUrl) {
  const match = /^data:(.+?);base64,(.+)$/u.exec(String(dataUrl ?? ''));
  if (!match) {
    throw new Error('Invalid image payload.');
  }

  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], 'base64'),
  };
}

function extensionForMime(mimeType, fileName) {
  const explicit = extname(fileName ?? '').replace('.', '');
  if (explicit) {
    return explicit.toLowerCase();
  }

  const map = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };

  return map[mimeType] ?? 'bin';
}

/**
 * Local-dev persistence adapter used by this repo.
 * Keep server.mjs talking to this interface so a future cloud adapter can
 * replace the implementation without changing route handlers.
 */
export function createLocalDevAdapter(rootDir) {
  const dataRoot = join(rootDir, '.wear-local');
  const mediaRoot = join(dataRoot, 'media');
  const dbPath = join(dataRoot, 'db.json');

  async function ensureStorage() {
    await mkdir(dataRoot, { recursive: true });
    await mkdir(mediaRoot, { recursive: true });

    try {
      await stat(dbPath);
    } catch {
      await writeFile(dbPath, JSON.stringify(ensureDbShape(), null, 2), 'utf8');
    }
  }

  async function readDb() {
    await ensureStorage();
    const raw = await readFile(dbPath, 'utf8');
    return ensureDbShape(JSON.parse(raw));
  }

  async function writeDb(db) {
    await ensureStorage();
    const tempPath = `${dbPath}.tmp`;
    await writeFile(tempPath, JSON.stringify(db, null, 2), 'utf8');
    await rename(tempPath, dbPath);
  }

  async function withDb(mutator) {
    const db = await readDb();
    const result = await mutator(db);
    await writeDb(db);
    return result;
  }

  function pruneExpiredState(db) {
    const now = Date.now();
    db.sessions = db.sessions.filter((session) => new Date(session.expiresAt).getTime() > now);

    for (const user of db.users) {
      if (user.resetTokenExpiresAt && new Date(user.resetTokenExpiresAt).getTime() <= now) {
        user.resetTokenHash = null;
        user.resetTokenExpiresAt = null;
      }
    }
  }

  async function createUser({ email, password }) {
    const normalizedEmail = String(email).trim().toLowerCase();

    return withDb(async (db) => {
      pruneExpiredState(db);
      if (db.users.some((user) => user.email === normalizedEmail)) {
        throw new Error('An account with that email already exists.');
      }

      const { salt, hash } = scryptPassword(password);
      const user = {
        id: `usr_${randomUUID()}`,
        email: normalizedEmail,
        displayName: normalizedEmail.split('@')[0],
        passwordSalt: salt,
        passwordHash: hash,
        createdAt: nowIso(),
        onboarded: false,
        importedLegacyData: false,
        profile: null,
        wardrobe: [],
        collections: [],
        eventSession: { ...EMPTY_EVENT_SESSION },
        mediaAssets: [],
        resetTokenHash: null,
        resetTokenExpiresAt: null,
      };

      db.users.push(user);
      return sanitizeUser(user);
    });
  }

  async function authenticateUser({ email, password }) {
    const normalizedEmail = String(email).trim().toLowerCase();
    const db = await readDb();
    pruneExpiredState(db);
    const user = db.users.find((entry) => entry.email === normalizedEmail);

    if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
      return null;
    }

    await writeDb(db);
    return sanitizeUser(user);
  }

  async function createSession(userId) {
    const token = randomBytes(32).toString('hex');
    const tokenHash = hashSecret(token);
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

    return withDb(async (db) => {
      pruneExpiredState(db);
      const user = db.users.find((entry) => entry.id === userId);
      if (!user) {
        throw new Error('Unable to create a session for that user.');
      }

      db.sessions.push({
        id: `sess_${randomUUID()}`,
        tokenHash,
        userId,
        createdAt: nowIso(),
        expiresAt,
      });

      return {
        token,
        expiresAt,
        user: sanitizeUser(user),
      };
    });
  }

  async function getSession(token) {
    if (!token) {
      return null;
    }

    const tokenHash = hashSecret(token);
    const db = await readDb();
    pruneExpiredState(db);
    const session = db.sessions.find((entry) => entry.tokenHash === tokenHash);

    if (!session) {
      await writeDb(db);
      return null;
    }

    const user = db.users.find((entry) => entry.id === session.userId);
    await writeDb(db);

    if (!user) {
      return null;
    }

    return {
      session: {
        expiresAt: session.expiresAt,
      },
      user: sanitizeUser(user),
    };
  }

  async function destroySession(token) {
    if (!token) {
      return;
    }

    const tokenHash = hashSecret(token);

    await withDb(async (db) => {
      pruneExpiredState(db);
      db.sessions = db.sessions.filter((entry) => entry.tokenHash !== tokenHash);
    });
  }

  async function requestPasswordReset(email) {
    const normalizedEmail = String(email).trim().toLowerCase();
    const resetToken = randomBytes(24).toString('hex');

    return withDb(async (db) => {
      pruneExpiredState(db);
      const user = db.users.find((entry) => entry.email === normalizedEmail);

      if (!user) {
        return { ok: true };
      }

      user.resetTokenHash = hashSecret(resetToken);
      user.resetTokenExpiresAt = new Date(Date.now() + RESET_TTL_MS).toISOString();

      return {
        ok: true,
        devResetToken: resetToken,
        expiresAt: user.resetTokenExpiresAt,
      };
    });
  }

  async function resetPassword(token, nextPassword) {
    const tokenHash = hashSecret(token);

    return withDb(async (db) => {
      pruneExpiredState(db);
      const user = db.users.find((entry) => entry.resetTokenHash === tokenHash);

      if (!user || !user.resetTokenExpiresAt) {
        throw new Error('That reset token is invalid or expired.');
      }

      const { salt, hash } = scryptPassword(nextPassword);
      user.passwordSalt = salt;
      user.passwordHash = hash;
      user.resetTokenHash = null;
      user.resetTokenExpiresAt = null;

      return sanitizeUser(user);
    });
  }

  async function getUserState(userId) {
    const db = await readDb();
    pruneExpiredState(db);
    const user = db.users.find((entry) => entry.id === userId);
    await writeDb(db);

    if (!user) {
      throw new Error('User not found.');
    }

    return user;
  }

  async function getProfile(userId) {
    const user = await getUserState(userId);
    return {
      profile: user.profile,
      onboarded: Boolean(user.onboarded),
      importedLegacyData: Boolean(user.importedLegacyData),
    };
  }

  async function saveProfile(userId, profile, { onboarded } = {}) {
    return withDb(async (db) => {
      pruneExpiredState(db);
      const user = db.users.find((entry) => entry.id === userId);
      if (!user) {
        throw new Error('User not found.');
      }

      user.profile = profile;
      if (typeof onboarded === 'boolean') {
        user.onboarded = onboarded;
      }
      if (profile?.name?.trim()) {
        user.displayName = profile.name.trim();
      }

      return {
        profile: user.profile,
        onboarded: Boolean(user.onboarded),
        importedLegacyData: Boolean(user.importedLegacyData),
      };
    });
  }

  async function getWardrobe(userId) {
    const user = await getUserState(userId);
    return user.wardrobe ?? [];
  }

  async function saveWardrobe(userId, wardrobe) {
    return withDb(async (db) => {
      pruneExpiredState(db);
      const user = db.users.find((entry) => entry.id === userId);
      if (!user) {
        throw new Error('User not found.');
      }

      user.wardrobe = wardrobe;
      return user.wardrobe;
    });
  }

  async function getCollections(userId) {
    const user = await getUserState(userId);
    return user.collections ?? [];
  }

  async function saveCollections(userId, collections) {
    return withDb(async (db) => {
      pruneExpiredState(db);
      const user = db.users.find((entry) => entry.id === userId);
      if (!user) {
        throw new Error('User not found.');
      }

      user.collections = collections;
      return user.collections;
    });
  }

  async function getEventSession(userId) {
    const user = await getUserState(userId);
    return user.eventSession ?? { ...EMPTY_EVENT_SESSION };
  }

  async function saveEventSession(userId, eventSession) {
    return withDb(async (db) => {
      pruneExpiredState(db);
      const user = db.users.find((entry) => entry.id === userId);
      if (!user) {
        throw new Error('User not found.');
      }

      user.eventSession = eventSession ?? { ...EMPTY_EVENT_SESSION };
      return user.eventSession;
    });
  }

  async function markImportedLegacyData(userId) {
    return withDb(async (db) => {
      pruneExpiredState(db);
      const user = db.users.find((entry) => entry.id === userId);
      if (!user) {
        throw new Error('User not found.');
      }

      user.importedLegacyData = true;
      return sanitizeUser(user);
    });
  }

  async function createMediaAsset(userId, { imageDataUrl, fileName, kind = 'wardrobe-upload', linkedItemId = null }) {
    const { mimeType, buffer } = parseDataUrl(imageDataUrl);
    const extension = extensionForMime(mimeType, fileName);
    const assetId = `media_${randomUUID()}`;
    const userMediaDir = join(mediaRoot, userId);
    const assetPath = join(userMediaDir, `${assetId}.${extension}`);

    await mkdir(userMediaDir, { recursive: true });
    await writeFile(assetPath, buffer);

    return withDb(async (db) => {
      pruneExpiredState(db);
      const user = db.users.find((entry) => entry.id === userId);
      if (!user) {
        throw new Error('User not found.');
      }

      const asset = {
        id: assetId,
        ownerUserId: userId,
        kind,
        createdAt: nowIso(),
        fileName: fileName || `${assetId}.${extension}`,
        mimeType,
        sizeBytes: buffer.byteLength,
        linkedItemId,
        path: assetPath,
      };

      user.mediaAssets = [asset, ...(user.mediaAssets ?? [])];
      return buildMediaResponse(asset);
    });
  }

  async function listMediaAssets(userId) {
    const user = await getUserState(userId);
    return (user.mediaAssets ?? []).map(buildMediaResponse);
  }

  async function getMediaAsset(userId, mediaAssetId) {
    const user = await getUserState(userId);
    const asset = (user.mediaAssets ?? []).find((entry) => entry.id === mediaAssetId);

    if (!asset) {
      return null;
    }

    return asset;
  }

  async function updateMediaAsset(userId, mediaAssetId, patch) {
    return withDb(async (db) => {
      pruneExpiredState(db);
      const user = db.users.find((entry) => entry.id === userId);
      if (!user) {
        throw new Error('User not found.');
      }

      const asset = (user.mediaAssets ?? []).find((entry) => entry.id === mediaAssetId);
      if (!asset) {
        throw new Error('Media asset not found.');
      }

      if (Object.prototype.hasOwnProperty.call(patch, 'linkedItemId')) {
        asset.linkedItemId = patch.linkedItemId ?? null;
      }

      return buildMediaResponse(asset);
    });
  }

  async function deleteMediaAsset(userId, mediaAssetId) {
    let removedPath = null;

    await withDb(async (db) => {
      pruneExpiredState(db);
      const user = db.users.find((entry) => entry.id === userId);
      if (!user) {
        throw new Error('User not found.');
      }

      const nextAssets = [];
      for (const asset of user.mediaAssets ?? []) {
        if (asset.id === mediaAssetId) {
          removedPath = asset.path;
        } else {
          nextAssets.push(asset);
        }
      }
      user.mediaAssets = nextAssets;
    });

    if (removedPath) {
      await unlink(removedPath).catch(() => {});
    }
  }

  async function readMediaDataUrl(userId, mediaAssetId) {
    const asset = await getMediaAsset(userId, mediaAssetId);
    if (!asset) {
      throw new Error('Media asset not found.');
    }

    const buffer = await readFile(asset.path);
    return `data:${asset.mimeType};base64,${buffer.toString('base64')}`;
  }

  async function getMediaContent(userId, mediaAssetId) {
    const asset = await getMediaAsset(userId, mediaAssetId);
    if (!asset) {
      return null;
    }

    return {
      mimeType: asset.mimeType,
      buffer: await readFile(asset.path),
      fileName: asset.fileName,
    };
  }

  async function clearAllData() {
    await rm(dataRoot, { recursive: true, force: true });
  }

  return {
    authenticateUser,
    buildMediaResponse,
    clearAllData,
    createMediaAsset,
    createSession,
    createUser,
    deleteMediaAsset,
    destroySession,
    getCollections,
    getEventSession,
    getMediaAsset,
    getMediaContent,
    getProfile,
    getSession,
    getWardrobe,
    listMediaAssets,
    markImportedLegacyData,
    readMediaDataUrl,
    requestPasswordReset,
    resetPassword,
    saveCollections,
    saveEventSession,
    saveProfile,
    saveWardrobe,
    updateMediaAsset,
  };
}
