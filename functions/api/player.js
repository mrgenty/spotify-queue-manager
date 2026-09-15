import { json } from '../_http.js';
import { spotifyFetch, spotifyError, trackFromSpotify } from '../_spotify.js';

export async function onRequestGet({ env }) {
  try {
    // The authenticated account already supplies its country to Spotify.
    // Omitting market also keeps this endpoint aligned with the admin status endpoint.
    const response = await spotifyFetch(env, '/me/player');
    if (response.status === 204) return json({ isPlaying: false, track: null });
    if (!response.ok) { const e = await spotifyError(response); return json({ error: e.error, code: response.status === 403 ? 'MISSING_PLAYBACK_SCOPE' : 'SPOTIFY_ERROR' }, e.status); }
    const data = await response.json();
    return json({ isPlaying: Boolean(data.is_playing), track: trackFromSpotify(data.item), progressMs: data.progress_ms || 0 });
  } catch (error) {
    console.error('player:', error.message);
    return json({ error: 'Impossibile leggere il player Spotify.' }, 503);
  }
}
