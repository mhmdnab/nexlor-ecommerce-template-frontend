import type { ApiError } from '@repo/types';
import { env } from './env';

export class ApiClientError extends Error {
  status: number;
  body: ApiError | null;
  constructor(status: number, message: string, body: ApiError | null) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function parse(res: Response) {
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/**
 * Browser fetch wrapper. Sends httpOnly auth cookies (credentials: 'include')
 * and transparently refreshes the access token once on 401, then retries.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}, _retry = false): Promise<T> {
  const res = await fetch(`${env.API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });

  if (res.status === 401 && !_retry && !path.startsWith('/auth/')) {
    const refreshed = await fetch(`${env.API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (refreshed.ok) return apiFetch<T>(path, init, true);
  }

  if (!res.ok) {
    const body = (await parse(res)) as ApiError | null;
    const message = Array.isArray(body?.message)
      ? body!.message.join(', ')
      : body?.message ?? `Request failed (${res.status})`;
    throw new ApiClientError(res.status, message, body);
  }

  return (await parse(res)) as T;
}

/** Server-side fetch for public data (no cookies). Used in RSC/metadata. */
export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${env.API_URL}${path}`, { cache: 'no-store' });
  if (!res.ok) throw new ApiClientError(res.status, `Request failed (${res.status})`, null);
  return (await res.json()) as T;
}

// Small typed helpers
export const apiJson = <T>(path: string, method: string, body?: unknown) =>
  apiFetch<T>(path, { method, body: body ? JSON.stringify(body) : undefined });
