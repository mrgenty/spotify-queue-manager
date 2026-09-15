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

  return new Response(maintenanceAsset.body, {
    status: 503,
    statusText: 'Service Unavailable',
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Retry-After': '300',
      'Cache-Control': 'no-store',
    },
  });
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
