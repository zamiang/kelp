const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

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
  mode: 'production',
  devtool: false,
  entry: {
    popup: path.join(__dirname, 'src/popup.tsx'),
    // content: path.join(__dirname, 'src/content.ts'),
    background: path.join(__dirname, 'src/background.ts'),
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
    extensions: ['.js', '.jsx', '.tsx', '.ts'],
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
  },
  devServer: {
    contentBase: './dist',
  },
  plugins: [
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
