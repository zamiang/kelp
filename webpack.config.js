const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { EnvironmentPlugin } = require('webpack');
const S3Plugin = require('webpack-s3-plugin');
const secrets = require('./secrets.json');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';
const currentWorkingDirectory = process.cwd();

const paths = {
  app: path.resolve(currentWorkingDirectory, 'app'),
  dist: path.resolve(currentWorkingDirectory, 'dist'),
  assets: path.resolve(currentWorkingDirectory, 'public'),
  modules: path.resolve(currentWorkingDirectory, 'node_modules'),
};

const node = {
  __dirname: true,
  __filename: true,
};

const plugins = [
  new CleanWebpackPlugin(),
  new CopyWebpackPlugin({
    patterns: [{ from: '../favicons', to: '' }],
  }),
  new HtmlWebpackPlugin({
    title: 'Time',
    lang: 'en-US',
    appMountId: 'root',
    template: 'template.html',
  }),
  new EnvironmentPlugin({
    GOOGLE_CLIENT_ID: secrets.googleClientId,
    GOOGLE_CLIENT_SECRET: secrets.googleClientSecret,
    NODE_ENV: 'development',
  }),
];
if (isProduction) {
  plugins.push(
    new S3Plugin({
      include: [/.*\.(css|js|html)/],
      s3Options: {
        accessKeyId: secrets.awsAccessKeyId,
        secretAccessKey: secrets.awsSecretAccessKey,
      },
      s3UploadOptions: {
        Bucket: 'www.collasso.me',
      },
      /*
      cloudfrontInvalidateOptions: {
        DistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
        Items: ['/*'],
      },
      */
    }),
  );
}

const getClientConfig = () => ({
  context: paths.app,
  devtool: isProduction ? false : 'inline-source-map',
  entry: {
    app: './app.tsx',
  },
  devServer: {
    contentBase: './dist',
  },
  mode: isProduction ? 'production' : 'development',
  node,
  plugins,
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.m?tsx?$/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
      {
        use: [
          {
            loader: 'url-loader',
            options: { name: '[hash].[ext]', limit: 30000 },
          },
        ],
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2)$/,
      },
    ],
  },
  externals: {
    gapi: 'gapi',
  },
  output: {
    chunkFilename: isProduction ? '[name].[hash].bundle.js' : '[name].bundle.js',
    filename: isProduction ? '[name].[hash].js' : '[name].js',
    path: paths.assets,
    pathinfo: false, // https://medium.com/@kenneth_chau/speeding-up-webpack-typescript-incremental-builds-by-7x-3912ba4c1d15
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    modules: [paths.app, paths.modules],
    // if you don't use symlinks (e.g. npm link or yarn link). disabling can improve performance
    symlinks: false,
    // if you use custom resolving plugins, that are not context specific disabling can improve perf
    cacheWithContext: false,
  },
  target: 'web',
  optimization: {
    removeAvailableModules: isProduction,
    removeEmptyChunks: isProduction,
    splitChunks: isProduction ? undefined : false,
  },
});

module.exports = getClientConfig();
