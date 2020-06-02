/**
 * process.env.NODE_ENV is used to determine to return production config or not
 * env is a string passed by "webpack --env" on command line or calling this function directly
 *
 */
const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const isProduction = process.env.NODE_ENV === "production";

const CURRENT_WORKING_DIR = process.cwd();

const paths = {
  app: path.resolve(CURRENT_WORKING_DIR, "app"),
  dist: path.resolve(CURRENT_WORKING_DIR, "dist"),
  assets: path.resolve(CURRENT_WORKING_DIR, "public"),
  modules: path.resolve(CURRENT_WORKING_DIR, "node_modules"),
};

const node = {
  __dirname: true,
  __filename: true,
};

const getClientConfig = () => ({
  context: paths.app,
  devtool: isProduction ? false : "inline-source-map",
  entry: {
    app: "./app.tsx",
  },
  devServer: {
    contentBase: "./dist",
  },
  mode: isProduction ? "production" : "development",
  node,
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: "Time",
      lang: "en-US",
      appMountId: "root",
      template: require("html-webpack-template"),
    }),
  ],
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.m?tsx?$/,
        use: [
          {
            loader: "babel-loader",
          },
        ],
      },
      {
        use: [
          {
            loader: "url-loader",
            options: { name: "[hash].[ext]", limit: 30000 },
          },
        ],
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2)$/,
      },
    ],
  },
  output: {
    chunkFilename: isProduction
      ? "[name].[hash].bundle.js"
      : "[name].bundle.js",
    filename: isProduction ? "[name].[hash].js" : "[name].js",
    path: paths.assets,
    pathinfo: false, // https://medium.com/@kenneth_chau/speeding-up-webpack-typescript-incremental-builds-by-7x-3912ba4c1d15
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
    modules: [paths.app, paths.modules],
    // if you don't use symlinks (e.g. npm link or yarn link). disabling can improve performance
    symlinks: false,
    // if you use custom resolving plugins, that are not context specific disabling can improve perf
    cacheWithContext: false,
  },
  target: "web",
  optimization: {
    removeAvailableModules: isProduction,
    removeEmptyChunks: isProduction,
    splitChunks: isProduction ? undefined : false,
  },
});

module.exports = getClientConfig();
