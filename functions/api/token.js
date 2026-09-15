import { json } from '../_http.js';
export function onRequestGet() {
  return json({ error: 'Endpoint rimosso: il token Spotify non viene più esposto al browser.' }, 404);
}
