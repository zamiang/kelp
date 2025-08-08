import { createSecureHeaders } from 'next-secure-headers';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  webpack: (config) => {
    // Handle SVG files
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

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

export default nextConfig;
