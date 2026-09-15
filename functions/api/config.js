import { json } from '../_http.js';
export function onRequestGet({ env }) {
  return json({
    eventName: env.EVENT_NAME || 'Il Nostro Fantastico Evento',
    googleAnalyticsId: env.GOOGLE_ANALYTICS_ID || null,
    adminEnabled: Boolean(env.ADMIN_PASSWORD),
  });
}
