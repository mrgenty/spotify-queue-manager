import { json, badRequest } from '../_http.js';
import { spotifyFetch, spotifyError, trackFromSpotify, marketFor } from '../_spotify.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const query = (url.searchParams.get('q') || '').trim();
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 10), 1), 20);
  if (query.length < 2 || query.length > 100) return badRequest('Inserisci una ricerca tra 2 e 100 caratteri.');
  try {
    const response = await spotifyFetch(env, `/search?${new URLSearchParams({ q: query, type: 'track', limit: String(limit), market: marketFor(env) })}`);
    if (!response.ok) { const e = await spotifyError(response); return json({ error: e.error, code: 'SPOTIFY_SEARCH_ERROR' }, e.status); }
    const data = await response.json();
    return json({ items: (data.tracks?.items || []).map(trackFromSpotify).filter(Boolean) });
  } catch (error) {
    console.error('search:', error.message);
    return json({ error: 'Ricerca non disponibile.' }, 503);
  }
}
