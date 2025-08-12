import path from 'path';
import webpack from 'webpack';
import CopyPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import { PurgeCSSPlugin } from 'purgecss-webpack-plugin';
import glob from 'glob-all';
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
      app: path.join(__dirname, 'src/app.tsx'),
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
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                modules: false,
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
          test: /\.module\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                modules: true,
              },
            },
          ],
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
    optimization: {
      minimizer: [
        '...',
        ...(isProduction
          ? [
              new CssMinimizerPlugin({
                minimizerOptions: {
                  preset: [
                    'default',
                    {
                      discardComments: { removeAll: true },
                      normalizeWhitespace: true,
                      colormin: true,
                      convertValues: true,
                      discardDuplicates: true,
                      discardEmpty: true,
                      mergeRules: true,
                      minifyFontValues: true,
                      minifyGradients: true,
                      minifyParams: true,
                      minifySelectors: true,
                      reduceIdents: false, // Keep CSS custom properties
                      reduceTransforms: true,
                      svgo: true,
                    },
                  ],
                },
              }),
            ]
          : []),
      ],
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
      new MiniCssExtractPlugin({
        filename: isProduction ? 'styles.css' : 'styles.css',
      }),
      ...(isProduction
        ? [
            // Temporarily disable PurgeCSS to debug CSS extraction
            // new PurgeCSSPlugin({
            //   paths: glob.sync([
            //     path.join(__dirname, 'src/**/*.{ts,tsx,js,jsx}'),
            //     path.join(__dirname, 'public/**/*.html'),
            //     path.join(__dirname, '../components/**/*.{ts,tsx,js,jsx}'),
            //   ]),
            //   safelist: {
            //     // Preserve theme-related classes and CSS custom properties
            //     standard: [
            //       /^theme-/,
            //       /^data-theme/,
            //       /^--color-/,
            //       /^--spacing-/,
            //       /^--font-/,
            //       /^--radius-/,
            //       /^--shadow-/,
            //       /^--transition-/,
            //       /^fade-in/,
            //       /^slide-in/,
            //       /^loading-spinner/,
            //       /^sr-only/,
            //       /^visually-hidden/,
            //       /^theme-changing/,
            //       // Phase 4 CSS classes
            //       /^popup-/,
            //       /^extension-/,
            //       /^shared-/,
            //       /^alert/,
            //       /^dashboard-/,
            //       /^popup-auth-/,
            //       /^popup-loading-/,
            //       /^popup-responsive-/,
            //       /^popup-error/,
            //       /^popup-button/,
            //       /^popup-container/,
            //       /^popup-content/,
            //       /^popup-actions/,
            //       /^popup-main/,
            //       /^popup-header/,
            //       /^popup-footer/,
            //       /^popup-sidebar/,
            //     ],
            //     // Preserve dynamic classes that might be added via JavaScript
            //     deep: [
            //       /MuiButton/,
            //       /MuiDialog/,
            //       /MuiTextField/,
            //       /MuiTypography/,
            //       /MuiBox/,
            //       /MuiPaper/,
            //       /MuiCard/,
            //       /MuiList/,
            //       /MuiMenuItem/,
            //       /MuiIconButton/,
            //       /MuiChip/,
            //       /MuiAvatar/,
            //       /MuiDivider/,
            //       /MuiTooltip/,
            //       /MuiPopover/,
            //       /MuiMenu/,
            //     ],
            //     // Preserve keyframe animations
            //     keyframes: ['spin', 'fadeIn', 'slideIn'],
            //   },
            //   // Don't remove CSS custom properties
            //   variables: true,
            //   // Keep CSS custom properties and theme variables
            //   keyframes: true,
            // }),
          ]
        : []),
      new CopyPlugin({
        patterns: [
          { from: path.join(__dirname, 'public'), to: '.' },
          { from: path.join(__dirname, '../public/fonts'), to: 'fonts' },
          {
            from: path.join(__dirname, 'src/manifest.json'),
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
