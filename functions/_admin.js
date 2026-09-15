import { json } from './_http.js';

const COOKIE = 'sqm_admin';
const encoder = new TextEncoder();

function b64(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
async function signature(value, secret) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64(await crypto.subtle.sign('HMAC', key, encoder.encode(value)));
}

export async function signAdmin(exp, secret) {
  const value = String(exp);
  return `${value}.${await signature(value, secret)}`;
}

export async function isAdmin(request, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const cookie = request.headers.get('Cookie')?.match(new RegExp(`${COOKIE}=([^;]+)`))?.[1];
  if (!cookie) return false;
  const [exp, sig] = cookie.split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const expected = await signature(exp, env.ADMIN_PASSWORD);
  return sig === expected;
}

export function requireAdmin(request, env) {
  return isAdmin(request, env).then(ok => ok ? null : json({ error: 'Accesso amministratore richiesto.' }, 401));
}

export { COOKIE };
