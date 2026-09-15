let cachedToken = null;
let cachedTokenExpiresAt = 0;

export async function getAccessToken(env) {
  const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret, SPOTIFY_REFRESH_TOKEN: refresh } = env;
  if (!id || !secret || !refresh) throw new Error('Spotify non configurato sul server.');
  if (cachedToken && Date.now() < cachedTokenExpiresAt - 60_000) return cachedToken;

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${id}:${secret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh }),
  });
  if (!response.ok) throw new Error('Impossibile autenticarsi con Spotify.');
  const data = await response.json();
  cachedToken = data.access_token;
  cachedTokenExpiresAt = Date.now() + Number(data.expires_in || 3600) * 1000;
  return cachedToken;
}

export async function spotifyFetch(env, path, options = {}) {
  const token = await getAccessToken(env);
  const response = await fetch(`https://api.spotify.com/v1${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...(options.headers || {}) },
  });
  return response;
}

export async function spotifyError(response) {
  let providerMessage = '';
  try {
    const body = await response.clone().json();
    providerMessage = body?.error?.message || body?.error_description || body?.message || '';
  } catch {}
  if (providerMessage) console.error(`Spotify ${response.status}:`, providerMessage);
  if (response.status === 204) return { status: 204, error: null };
  if (response.status === 401) return { status: 502, error: 'Sessione Spotify scaduta o non autorizzata.' };
  if (response.status === 403) return { status: 403, error: 'Spotify ha negato questa operazione. Verifica gli scope OAuth e che l’account sia autorizzato nell’app Spotify.' };
  if (response.status === 404) return { status: 409, error: 'Nessun dispositivo Spotify attivo.' };
  if (response.status === 429) return { status: 429, error: 'Spotify sta limitando le richieste. Riprova tra poco.' };
  return { status: 502, error: 'Spotify non è momentaneamente disponibile.' };
}

export function trackFromSpotify(item) {
  return item ? {
    uri: item.uri || '',
    track: item.name || 'Traccia sconosciuta',
    artists: (item.artists || []).map(a => a.name).filter(Boolean).join(', '),
    albumCover: item.album?.images?.[0]?.url || '',
    preview: item.preview_url || null,
    durationMs: item.duration_ms || 0,
  } : null;
}

export function validTrackUri(uri) {
  return typeof uri === 'string' && /^spotify:track:[A-Za-z0-9]{22}$/.test(uri);
}

export function marketFor(env) {
  const market = String(env.SPOTIFY_MARKET || 'IT').toUpperCase();
  return /^[A-Z]{2}$/.test(market) ? market : 'IT';
}
