const { createSecureHeaders } = require('next-secure-headers');

module.exports = {
  reactStrictMode: true,
  poweredByHeader: false,

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
              imgSrc: [
                "'self'",
                'https://placeimg.com',
                'https://drive-thirdparty.googleusercontent.com/',
                'https://*.googleusercontent.com',
              ],
              scriptSrc: [
                "'self'",
                "'unsafe-eval'",
                'https://apis.google.com',
                'https://www.googletagmanager.com',
                'https://vitals.vercel-analytics.com',
              ],
              frameSrc: [
                'https://auth.kelp.nyc/',
                'https://content.googleapis.com/',
                'https://accounts.google.com/',
                'https://content-gmail.googleapis.com/',
                'https://content-driveactivity.googleapis.com/',
                'https://content-people.googleapis.com/',
              ],
              connectSrc: [
                "'self'",
                'https://auth.kelp.nyc/oauth/token',
                'https://www.google-analytics.com/',
              ],
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
