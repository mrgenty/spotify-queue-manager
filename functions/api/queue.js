import { json } from '../_http.js';
import { spotifyFetch, spotifyError, trackFromSpotify } from '../_spotify.js';

export async function onRequestGet({ env }) {
  try {
    const response = await spotifyFetch(env, '/me/player/queue');
    if (response.status === 204) return json({ nowPlaying: null, queue: [] });
    if (!response.ok) { const e = await spotifyError(response); return json({ error: e.error, code: response.status === 403 ? 'MISSING_PLAYBACK_SCOPE' : 'SPOTIFY_ERROR' }, e.status); }
    const data = await response.json();
    return json({
      nowPlaying: trackFromSpotify(data.currently_playing),
      queue: (data.queue || []).slice(0, 50).map(trackFromSpotify).filter(Boolean),
    });
  } catch (error) {
    console.error('queue:', error.message);
    return json({ error: 'Impossibile leggere la coda Spotify.' }, 503);
  }
}
