let searchAbort;
const API = '/api';

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) },
  });
  let data = null;
  try { data = await response.json(); } catch {}
  if (!response.ok) {
    const error = new Error(data?.error || 'Operazione non riuscita.');
    error.status = response.status; error.retryAfter = data?.retryAfter;
    throw error;
  }
  return data;
}

function canAddTrack() { return true; }
function saveTrackAddition() {}
window.canAddTrack = canAddTrack;
window.saveTrackAddition = saveTrackAddition;

async function addToQueue(trackUri) {
  if (!/^spotify:track:[A-Za-z0-9]{22}$/.test(trackUri || '')) return false;
  try {
    await request('/add', { method: 'POST', body: JSON.stringify({ uri: trackUri }) });
    window.UIBridge?.showToast?.('Aggiunto! Il tuo brano verrà suonato a breve!');
    return true;
  } catch (error) {
    const message = error.status === 429 && error.retryAfter
      ? `Limite raggiunto. Riprova tra ${Math.ceil(error.retryAfter / 60)} minuti.`
      : error.message;
    window.UIBridge?.showToast?.(message);
    return false;
  }
}
window.addToQueue = addToQueue;

async function doSearch(query, limit = 10) {
  const q = (query || '').trim();
  if (q.length < 2) { window.UIBridge?.showToast?.('Inserisci almeno 2 caratteri.'); return; }
  try {
    searchAbort?.abort(); searchAbort = new AbortController();
    window.UIBridge?.showLoading?.();
    const response = await fetch(`${API}/search?q=${encodeURIComponent(q)}&limit=${limit}`, { signal: searchAbort.signal, headers: { Accept: 'application/json' } });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || 'Ricerca non disponibile.');
    // Keep the API model independent from the legacy UI model.
    const items = (data.items || []).map(track => ({
      image: track.albumCover || '',
      title: track.track || 'Traccia sconosciuta',
      subtitle: track.artists || 'Artista sconosciuto',
      uri: track.uri || '',
      preview: track.preview || null,
    }));
    window.UIBridge?.renderItems?.(items, q);
  } catch (error) {
    if (error.name !== 'AbortError') { console.error('search:', error); window.UIBridge?.showError?.(error.message); }
  }
}

document.addEventListener('ui:search', e => doSearch(e?.detail?.query || '', e?.detail?.limit || 10));
