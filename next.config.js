const { createSecureHeaders } = require('next-secure-headers');

module.exports = {
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: createSecureHeaders({
          contentSecurityPolicy: {
            directives: {
              defaultSrc: "'self'",
              styleSrc: ["'self'", "'unsafe-inline'"],
              scriptSrc: ["'unsafe-eval'"],
              scriptSrcElem: ["'self'", 'https://apis.google.com'],
              frameSrc: [
                'https://kelp.us.auth0.com/',
                'https://content.googleapis.com/',
                'https://accounts.google.com/',
                'https://content-gmail.googleapis.com/',
              ],
              connectSrc: ["'self'", 'https://kelp.us.auth0.com/oauth/token'],
            },
          },
          forceHTTPSRedirect: true,
          referrerPolicy: 'same-origin',
          xssProtection: 'block-rendering',
        }),
      },
    ];
  },
};
