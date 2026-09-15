import { json } from '../../_http.js';
import { getClientIp } from '../../_http.js';
import { signAdmin, COOKIE } from '../../_admin.js';

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD) return json({ error: 'Pannello admin non configurato.' }, 503);
  const key = getClientIp(request); const now = Date.now();
  const recent = (loginAttempts.get(key) || []).filter(t => now - t < 15 * 60 * 1000);
  if (recent.length >= 5) return json({ error: 'Troppi tentativi. Riprova più tardi.' }, 429, { 'Retry-After': '900' });
  recent.push(now); loginAttempts.set(key, recent);
  let body; try { body = await request.json(); } catch { return json({ error: 'Richiesta non valida.' }, 400); }
  if (typeof body?.password !== 'string' || body.password !== env.ADMIN_PASSWORD) return json({ error: 'Password non corretta.' }, 401);
  const cookie = await signAdmin(Date.now() + 8 * 60 * 60 * 1000, env.ADMIN_PASSWORD);
  return json({ ok: true }, 200, { 'Set-Cookie': `${COOKIE}=${cookie}; Max-Age=28800; Path=/; HttpOnly; Secure; SameSite=Strict` });
}

const loginAttempts = new Map();
