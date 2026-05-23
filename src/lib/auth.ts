import { createHmac, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import type { APIContext, AstroCookies } from 'astro';
import { assertSupabase, supabase } from './db';

const COOKIE_NAME = 'thread_session';
const DAY = 60 * 60 * 24;

type UserRow = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
};

function secret() {
  return process.env.APP_SECRET || 'dev-secret-change-me';
}

function sign(value: string) {
  return createHmac('sha256', secret()).update(value).digest('hex');
}

export function hashPassword(password: string) {
  const salt = randomUUID();
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, key] = stored.split(':');
  if (!salt || !key) return false;

  const candidate = Buffer.from(scryptSync(password, salt, 64).toString('hex'), 'hex');
  const expected = Buffer.from(key, 'hex');
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export function createSessionValue(userId: string) {
  const payload = `${userId}.${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function readSessionUserId(cookies: AstroCookies) {
  const value = cookies.get(COOKIE_NAME)?.value;
  if (!value) return null;

  const parts = value.split('.');
  if (parts.length !== 3) return null;

  const payload = `${parts[0]}.${parts[1]}`;
  if (sign(payload) !== parts[2]) return null;

  return parts[0];
}

export async function currentUser(cookies: AstroCookies) {
  const userId = readSessionUserId(cookies);
  if (!userId) return null;

  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, password_hash')
    .eq('id', userId)
    .maybeSingle<UserRow>();

  return assertSupabase(data, error);
}

export function setSession(cookies: AstroCookies, userId: string) {
  cookies.set(COOKIE_NAME, createSessionValue(userId), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: DAY * 14
  });
}

export function clearSession(cookies: AstroCookies) {
  cookies.delete(COOKIE_NAME, { path: '/' });
}

export async function requireUser(context: APIContext) {
  const user = await currentUser(context.cookies);
  if (!user) {
    return null;
  }

  return user;
}

export async function logActivity(action: string, detail: string, userId?: string) {
  const { error } = await supabase.from('activity_logs').insert({
    action,
    user_id: userId || null,
    detail
  });
  assertSupabase(null, error);
}
