import path from 'path';
import webpack from 'webpack';
import CopyPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// COPIED FROM constants/config unsure why import doesn't work
const GOOGLE_CLIENT_ID = '296254551365-v8olgrucl4t2b1oa22fnr1r23390umvl.apps.googleusercontent.com';
const scopes = [
  'https://www.googleapis.com/auth/calendar.events.readonly',
  'https://www.googleapis.com/auth/contacts.readonly',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
];

const modifyManifest = (buffer) => {
  const manifest = JSON.parse(buffer.toString());
  manifest.oauth2.scopes = scopes;
  manifest.oauth2.client_id = GOOGLE_CLIENT_ID;
  return JSON.stringify(manifest, null, 2);
};

const getConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    mode: process.env.NODE_ENV,
    devtool: false,
    entry: {
      popup: path.join(__dirname, 'src/popup.tsx'),
      background: path.join(__dirname, 'src/background.ts'),
      color: path.join(__dirname, 'src/background-color.ts'),
      'content-script': path.join(__dirname, 'src/content-script.ts'),
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
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
              },
            },
          ],
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
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
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
          use: ['@svgr/webpack'],
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
        url: require.resolve('url/'),
        buffer: require.resolve('buffer/'),
        vm: require.resolve('vm-browserify'),
      },
      extensions: ['.js', '.jsx', '.tsx', '.ts'],
      alias: {
        'react-dom': 'react-dom',
        'process/browser': require.resolve('process/browser'),
      },
    },
    devServer: {
      contentBase: './dist',
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      }),
      ...(isProduction
        ? [
            new MiniCssExtractPlugin({
              filename: 'styles.css',
            }),
          ]
        : []),
      new CopyPlugin({
        patterns: [
          { from: 'public', to: '.' },
          { from: '../public/fonts', to: 'fonts' },
          {
            from: 'src/manifest.json',
            to: 'manifest.json',
            transform(content) {
              return modifyManifest(content);
            },
          },
        ],
      }),
    ],
  };
};

export default getConfig();
