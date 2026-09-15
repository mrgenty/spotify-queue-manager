import { json } from '../../_http.js';
import { requireAdmin } from '../../_admin.js';
import { spotifyFetch, spotifyError, trackFromSpotify } from '../../_spotify.js';
export async function onRequestGet({ request, env }) {
  const denied = await requireAdmin(request, env); if (denied) return denied;
  try {
    const [player, queue] = await Promise.all([spotifyFetch(env, '/me/player'), spotifyFetch(env, '/me/player/queue')]);
    const result = { isPlaying: false, nowPlaying: null, queue: [] };
    if (player.ok && player.status !== 204) { const p = await player.json(); result.isPlaying = Boolean(p.is_playing); result.nowPlaying = trackFromSpotify(p.item); result.progressMs = p.progress_ms || 0; }
    if (queue.ok) result.queue = ((await queue.json()).queue || []).map(trackFromSpotify).filter(Boolean);
    if (!player.ok && player.status !== 204) { const e = await spotifyError(player); return json({ error: e.error, code: player.status === 403 ? 'MISSING_PLAYBACK_SCOPE' : 'SPOTIFY_ERROR' }, e.status); }
    return json(result);
  } catch { return json({ error: 'Stato Spotify non disponibile.' }, 503); }
}
