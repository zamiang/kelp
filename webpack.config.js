const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { EnvironmentPlugin } = require("webpack");
const secrets = require("./secrets.json");

const isProduction = process.env.NODE_ENV === "production";
const currentWorkingDirectory = process.cwd();

const paths = {
  app: path.resolve(currentWorkingDirectory, "app"),
  dist: path.resolve(currentWorkingDirectory, "dist"),
  assets: path.resolve(currentWorkingDirectory, "public"),
  modules: path.resolve(currentWorkingDirectory, "node_modules"),
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
      headHtmlSnippet:
        '<script src="https://apis.google.com/js/api.js"></script>',
      template: require("html-webpack-template"),
    }),
    new EnvironmentPlugin({
      GOOGLE_CLIENT_ID: secrets.client_id,
      GOOGLE_CLIENT_SECRET: secrets.client_secret,
      NODE_ENV: "development",
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
