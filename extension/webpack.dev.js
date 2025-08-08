import { merge } from 'webpack-merge';
import common from './webpack.config.js';

const config = common;
config.devtool = 'inline-source-map';
config.mode = 'development';

export default config;
