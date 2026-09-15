import { json } from '../../_http.js';
import { requireAdmin } from '../../_admin.js';
import { spotifyFetch, spotifyError } from '../../_spotify.js';
export async function onRequestPost({ request, env }) {
  const denied = await requireAdmin(request, env); if (denied) return denied;
  let body; try { body = await request.json(); } catch { return json({ error: 'Richiesta non valida.' }, 400); }
  const paths = { pause: ['/me/player/pause', 'PUT'], play: ['/me/player/play', 'PUT'], next: ['/me/player/next', 'POST'] };
  const action = paths[body?.action]; if (!action) return json({ error: 'Azione non consentita.' }, 400);
  const response = await spotifyFetch(env, action[0], { method: action[1] });
  if (!response.ok && response.status !== 204) { const e = await spotifyError(response); return json({ error: e.error }, e.status); }
  return json({ ok: true });
}
