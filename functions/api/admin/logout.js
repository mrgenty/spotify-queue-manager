import { json } from '../../_http.js';
import { COOKIE } from '../../_admin.js';
export function onRequestPost() { return json({ ok: true }, 200, { 'Set-Cookie': `${COOKIE}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict` }); }
