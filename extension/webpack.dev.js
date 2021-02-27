const merge = require('webpack-merge');
const common = require('./webpack.config.js');

const config = common;
config.devtool = 'inline-source-map';
config.mode = 'development';

module.exports = config;
