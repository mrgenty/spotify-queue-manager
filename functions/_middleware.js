export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (env.MAINTENANCE !== 'TRUE') {
    const response = await next();
    return secure(response);
  }

  if (pathname.startsWith('/maintenance.html')) {
    return secure(await next());
  }

  const maintenanceAsset = await env.ASSETS.fetch(new URL('/maintenance.html', request.url));
  const safe = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const name = String(env.PAGE_NAME || env.EVENT_NAME || 'Spotify Queue Manager').trim().slice(0, 100);
  const color = /^#[0-9a-fA-F]{6}$/.test(String(env.HOME_COLOR || '').trim()) ? String(env.HOME_COLOR).trim() : '#1ed760';
  let icon = '';
  try {
    const url = new URL(String(env.HOME_ICON_URL || '').trim());
    if (url.protocol === 'https:') icon = '<img class="event-icon" src="' + safe(url.href) + '" alt="">';
  } catch {}
  const html = (await maintenanceAsset.text())
    .replace('__MAINTENANCE_TITLE__', safe(name + ' - Manutenzione'))
    .replace('__MAINTENANCE_COLOR__', color)
    .replace('__MAINTENANCE_ICON__', icon)
    .replace('__MAINTENANCE_EVENT__', safe(name));
  return secure(new Response(html, {
    status: 503,
    statusText: 'Service Unavailable',
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Retry-After': '300',
      'Cache-Control': 'no-store',
    },
  }));
}

function secure(response) {
  const headers = new Headers(response.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; connect-src 'self' https://api.spotify.com https://accounts.spotify.com https://www.google-analytics.com; frame-src https://open.spotify.com; object-src 'none'; base-uri 'self'; frame-ancestors 'self'");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
