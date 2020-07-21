module.exports = {
  presets: [
    [
      '@babel/env',
      {
        targets: {
          browsers: ['last 2 Chrome versions'],
        },
      },
    ],
    '@babel/plugin-syntax-dynamic-import',
    '@babel/preset-typescript',
    '@babel/preset-react',
  ],
  plugins: ['react-hot-loader/babel', 'lodash', 'date-fns'],
};
