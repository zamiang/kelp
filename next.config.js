const withPlugins = require('next-compose-plugins');
const { createSecureHeaders } = require('next-secure-headers');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const withFonts = require('next-fonts');
const withReactSvg = require('next-react-svg');
const path = require('path');

const nextConfig = {
  future: {
    webpack5: true,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (process.env.ANALYZE) {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: isServer ? 8888 : 8889,
          openAnalyzer: true,
        }),
      );
    }
    return config;
  },

  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
      {
        source: '/dashboard/(.*)',
        destination: '/dashboard',
      },
      {
        source: '/test-dashboard/(.*)',
        destination: '/test-dashboard',
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
                'data:',
                'https://placeimg.com',
                'https://drive-thirdparty.googleusercontent.com',
                'https://*.googleusercontent.com',
                //'https://platform.slack-edge.com',
                'https://www.googletagmanager.com',
              ],
              fontSrc: ["'self'"],
              scriptSrc: ["'self'", "'unsafe-eval'", 'https://apis.google.com'],
              frameSrc: [
                'https://auth.kelp.nyc',
                'https://content.googleapis.com',
                'https://accounts.google.com',
                'https://content-gmail.googleapis.com',
                'https://tasks.googleapis.com',
                'https://content-driveactivity.googleapis.com',
                'https://content-people.googleapis.com',
              ],
              connectSrc: [
                "'self'",
                'https://auth.kelp.nyc/oauth/token',
                // 'https://slack.com/api/conversations.list',
                'https://api.rollbar.com/api/1/item/',
                'https://content.googleapis.com',
                'https://accounts.google.com',
                'https://content-people.googleapis.com',
                'https://content-driveactivity.googleapis.com',
                'https://tasks.googleapis.com',
                'https://people.googleapis.com',
                'https://www.googleapis.com',
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

module.exports = withPlugins(
  [
    [
      withFonts,
      {
        reactStrictMode: true,
        poweredByHeader: false,
      },
    ],
    [
      withReactSvg,
      {
        include: path.resolve(__dirname, 'public'),
      },
    ],
  ],
  nextConfig,
);
