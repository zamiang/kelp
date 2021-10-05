const withPlugins = require('next-compose-plugins');
const { createSecureHeaders } = require('next-secure-headers');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const withFonts = require('next-fonts');
const withReactSvg = require('next-react-svg');
const path = require('path');

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack5: true,
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
        source: '/.well-known/microsoft-identity-association.json',
        destination: '/api/microsoft-auth',
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
              imgSrc: ["'self'", 'data:', 'https://www.googletagmanager.com'],
              fontSrc: ["'self'"],
              scriptSrc: [
                "'self'",
                "'unsafe-eval'",
                "'unsafe-inline'",
                'https://www.googletagmanager.com',
              ],
              frameSrc: [],
              connectSrc: ["'self'", 'https://www.googleapis.com'],
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
