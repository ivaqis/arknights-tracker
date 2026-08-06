import adapter from '@sveltejs/adapter-node';

export default {
    kit: {
        adapter: adapter({ precompress: true }),
        csp: {
            mode: 'auto',
            directives: {
                'default-src': ['self'],
                'script-src': ['self', 'unsafe-inline', 'unsafe-eval', 'https://www.googletagmanager.com', 'https://*.google-analytics.com', 'https://*.gstatic.com', 'https://apis.google.com', 'https://*.firebaseapp.com'],
                'style-src': ['self', 'unsafe-inline', 'https://fonts.googleapis.com'],
                'font-src': ['self', 'https://fonts.gstatic.com', 'data:'],
                'img-src': ['self', 'data:', 'blob:', 'https:', 'http:'],
                'connect-src': ['self', 'https:', 'http:', 'wss:', 'ws:'],
                'frame-src': ['self', 'https://*.firebaseapp.com', 'https://apis.google.com', 'https://accounts.google.com'],
                'object-src': ['none'],
                'base-uri': ['self'],
                'frame-ancestors': ['self']
            }
        }
    }
};