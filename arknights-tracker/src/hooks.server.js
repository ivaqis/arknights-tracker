export async function handle({ event, resolve }) {
    const response = await resolve(event);

    response.headers.set('Strict-Transport-Security', 'max-age=31536000');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');

    const cspDirectives = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://*.google-analytics.com https://*.gstatic.com https://apis.google.com https://*.firebaseapp.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: blob: https: http:",
        "media-src 'self' data: blob: https: http:",
        "connect-src 'self' https: http: wss: ws:",
        "frame-src 'self' https://*.firebaseapp.com https://apis.google.com https://accounts.google.com",
        "object-src 'none'",
        "base-uri 'self'",
        "frame-ancestors 'self'"
    ].join('; ');

    response.headers.set('Content-Security-Policy', cspDirectives);

    return response;
}
