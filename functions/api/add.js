import { json, badRequest, getClientIp } from '../_http.js';
import { spotifyFetch, spotifyError, validTrackUri } from '../_spotify.js';

const attempts = new Map();
const WINDOW = 10 * 60 * 1000;
const MAX = 3;

function allowed(ip) {
  const now = Date.now();
  const values = (attempts.get(ip) || []).filter(t => now - t < WINDOW);
  if (values.length >= MAX) return { ok: false, retryAfter: Math.ceil((WINDOW - (now - values[0])) / 1000) };
  values.push(now); attempts.set(ip, values);
  return { ok: true };
}

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return badRequest('Richiesta non valida.'); }
  const uri = body?.uri;
  if (!validTrackUri(uri)) return badRequest('URI Spotify non valido.');
  const limit = allowed(getClientIp(request));
  if (!limit.ok) return json({ error: 'Hai raggiunto il limite di richieste.', retryAfter: limit.retryAfter }, 429, { 'Retry-After': String(limit.retryAfter) });

  try {
    const [player, queue] = await Promise.all([
      spotifyFetch(env, '/me/player'),
      spotifyFetch(env, '/me/player/queue'),
    ]);
    if (player.ok && player.status !== 204) {
      const current = (await player.json()).item;
      if (current?.uri === uri) return json({ error: 'Il brano è già in riproduzione.' }, 409);
    }
    if (queue.ok) {
      const existing = await queue.json();
      if ((existing.queue || []).some(item => item.uri === uri)) return json({ error: 'Il brano è già in coda.' }, 409);
    }
    const response = await spotifyFetch(env, `/me/player/queue?${new URLSearchParams({ uri })}`, { method: 'POST' });
    if (!response.ok && response.status !== 204) { const e = await spotifyError(response); return json({ error: e.error }, e.status); }
    return json({ ok: true }, 201);
  } catch (error) {
    console.error('add:', error.message);
    return json({ error: 'Impossibile aggiungere il brano.' }, 503);
  }
}
