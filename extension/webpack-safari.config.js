import path from 'path';
import webpack from 'webpack';
import CopyPlugin from 'copy-webpack-plugin';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getConfig = () => ({
  mode: process.env.NODE_ENV,
  devtool: false,
  entry: {
    app: path.join(__dirname, 'src/app.tsx'),
    background: path.join(__dirname, 'src/background.ts'),
    calendar: path.join(__dirname, 'src/calendar.ts'),
  },
  output: {
    path: path.join(__dirname, 'safari/extension Extension/Resources'),
    filename: '[name].js',
  },
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
        use: ['@svgr/webpack'],
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
    new CopyPlugin({
      patterns: [
        { from: 'extension/public', to: '.' },
        {
          from: 'extension/src/manifest-safari.json',
          to: 'manifest.json',
        },
      ],
    }),
  ],
});

export default getConfig();
