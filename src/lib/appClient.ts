import type {
  ApiCollectionsResponse,
  ApiEventSessionResponse,
  ApiMediaAsset,
  ApiMediaListResponse,
  ApiPasswordResetResponse,
  ApiProfileResponse,
  ApiSessionResponse,
  ApiUserAccount,
  ApiWardrobeResponse,
} from './apiContract';
import { readFileAsDataUrl } from './fileData';

export type AppSession = {
  authenticated: boolean;
  user: ApiUserAccount | null;
  expiresAt?: string;
};

// When loaded via file:// (Electron production), relative paths won't resolve —
// prefix them with the API server's absolute origin.
const API_ORIGIN =
  typeof window !== 'undefined' && window.location.protocol === 'file:'
    ? 'http://127.0.0.1:8787'
    : '';

async function requestJson<T>(input: RequestInfo, init?: RequestInit) {
  const url =
    typeof input === 'string' && input.startsWith('/')
      ? `${API_ORIGIN}${input}`
      : input;
  const response = await fetch(url, {
    credentials: 'include',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? 'Request failed.');
  }

  return payload;
}

function toSession(payload: ApiSessionResponse): AppSession {
  if (!payload.authenticated) {
    return { authenticated: false, user: null };
  }

  return {
    authenticated: true,
    user: payload.user,
    expiresAt: payload.expiresAt ?? payload.session?.expiresAt,
  };
}

export async function getSession() {
  return toSession(await requestJson<ApiSessionResponse>('/api/auth/session', { method: 'GET' }));
}

export async function signUp(email: string, password: string) {
  return toSession(
    await requestJson<ApiSessionResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  );
}

export async function signIn(email: string, password: string) {
  return toSession(
    await requestJson<ApiSessionResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  );
}

export async function signOut() {
  return toSession(await requestJson<ApiSessionResponse>('/api/auth/logout', { method: 'POST' }));
}

export function requestPasswordReset(email: string) {
  return requestJson<ApiPasswordResetResponse>('/api/auth/request-password-reset', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, password: string) {
  return toSession(
    await requestJson<ApiSessionResponse>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),
  );
}

export function getProfile() {
  return requestJson<ApiProfileResponse>('/api/me/profile', { method: 'GET' });
}

export function saveProfile(profile: Record<string, unknown> | null, options?: { onboarded?: boolean; importedLegacyData?: boolean }) {
  return requestJson<ApiProfileResponse>('/api/me/profile', {
    method: 'PUT',
    body: JSON.stringify({
      profile,
      onboarded: options?.onboarded,
      importedLegacyData: options?.importedLegacyData,
    }),
  });
}

export async function getWardrobe<T>() {
  const payload = await requestJson<ApiWardrobeResponse>('/api/me/wardrobe', { method: 'GET' });
  return payload.wardrobe as T[];
}

export function saveWardrobe(wardrobe: unknown[]) {
  return requestJson<ApiWardrobeResponse>('/api/me/wardrobe', {
    method: 'PUT',
    body: JSON.stringify({ wardrobe }),
  });
}

export async function getCollections<T>() {
  const payload = await requestJson<ApiCollectionsResponse>('/api/me/collections', { method: 'GET' });
  return payload.collections as T[];
}

export function saveCollections(collections: unknown[]) {
  return requestJson<ApiCollectionsResponse>('/api/me/collections', {
    method: 'PUT',
    body: JSON.stringify({ collections }),
  });
}

export function getEventSession() {
  return requestJson<ApiEventSessionResponse>('/api/me/event-session', { method: 'GET' });
}

export function saveEventSession(session: ApiEventSessionResponse) {
  return requestJson<ApiEventSessionResponse>('/api/me/event-session', {
    method: 'PUT',
    body: JSON.stringify(session),
  });
}

export async function getMediaAssets() {
  const payload = await requestJson<ApiMediaListResponse>('/api/media', { method: 'GET' });
  return payload.media;
}

export async function uploadMediaAsset(file: File, options?: { kind?: ApiMediaAsset['kind']; linkedItemId?: string | null }) {
  const imageDataUrl = await readFileAsDataUrl(file);
  return requestJson<ApiMediaAsset>('/api/media/upload', {
    method: 'POST',
    body: JSON.stringify({
      imageDataUrl,
      fileName: file.name,
      kind: options?.kind ?? 'wardrobe-upload',
      linkedItemId: options?.linkedItemId ?? null,
    }),
  });
}

export function updateMediaAsset(mediaAssetId: string, patch: { linkedItemId?: string | null }) {
  return requestJson<ApiMediaAsset>(`/api/media/${mediaAssetId}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export async function deleteMediaAsset(mediaAssetId: string) {
  await requestJson<{ ok: true }>(`/api/media/${mediaAssetId}`, { method: 'DELETE' });
}
