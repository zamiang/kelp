module.exports = {
  poweredByHeader: false,

  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/dashboard/calendar',
        permanent: false,
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/',
        headers: [
          {
            key: 'strict-transport-security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};
