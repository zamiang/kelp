const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

// COPIED FROM constancs/config unsure why import doesn't work
const GOOGLE_OAUTH_TOKEN =
  '296254551365-v8olgrucl4t2b1oa22fnr1r23390umvl.apps.googleusercontent.com';
const scopes = [
  'https://www.googleapis.com/auth/calendar.events.readonly',
  'https://www.googleapis.com/auth/contacts.readonly',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.activity.readonly',
  'https://www.googleapis.com/auth/drive.file',
];

const modifyManifest = (buffer) => {
  const manifest = JSON.parse(buffer.toString());
  manifest.oauth2.scopes = scopes;
  manifest.oauth2.client_id = GOOGLE_OAUTH_TOKEN;
  return JSON.stringify(manifest, null, 2);
};

const getConfig = () => ({
  mode: process.env.NODE_ENV,
  devtool: false,
  entry: {
    popup: path.join(__dirname, 'src/popup.tsx'),
    background: path.join(__dirname, 'src/background.ts'),
    capture: path.join(__dirname, 'src/capture.ts'),
    calendar: path.join(__dirname, 'src/calendar.ts'),
  },
  output: { path: path.join(__dirname, 'dist'), filename: '[name].js' },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        exclude: /\.module\.css$/,
      },
      {
        test: /\.ts(x)?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: true,
            },
          },
        ],
        include: /\.module\.css$/,
      },
      {
        test: /\.svg$/,
        use: [
          'babel-loader',
          {
            loader: 'react-svg-loader',
            options: {
              svgo: {
                plugins: [{ removeTitle: false }],
                floatPrecision: 2,
              },
            },
          },
        ],
      },
      {
        test: /\.(woff2)$/,
        use: 'file-loader',
      },
      {
        test: /\.png$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              mimetype: 'image/png',
            },
          },
        ],
      },
    ],
  },
  resolve: {
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
    },
    extensions: ['.js', '.jsx', '.tsx', '.ts'],
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
  },
  devServer: {
    contentBase: './dist',
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID': undefined,
      'process.env.NEXT_PUBLIC_REDIRECT_URI': undefined,
      'process.env.NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN': undefined,
    }),
    new CopyPlugin({
      patterns: [
        { from: 'extension/public', to: '.' },
        {
          from: 'extension/src/manifest.json',
          to: 'manifest.json',
          transform(content) {
            return modifyManifest(content);
          },
        },
      ],
    }),
  ],
});

module.exports = getConfig();
