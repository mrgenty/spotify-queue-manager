import { json } from '../_http.js';
export function onRequestGet({ env }) {
  return json({
    eventName: env.EVENT_NAME || 'Il Nostro Fantastico Evento',
    googleAnalyticsId: env.GOOGLE_ANALYTICS_ID || null,
    adminEnabled: Boolean(env.ADMIN_PASSWORD),
    pageName: String(env.PAGE_NAME || '').trim().slice(0, 100),
    homeIconUrl: String(env.HOME_ICON_URL || '').trim().slice(0, 2048),
    homeColor: /^#[0-9a-fA-F]{6}$/.test(String(env.HOME_COLOR || '').trim()) ? String(env.HOME_COLOR).trim() : null,
  });
}
