'use strict';
const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExternalDepsPlugin = new CopyWebpackPlugin([
  { from: 'src/assets/icon.png', to: 'assets/icon.png' },
  { from: 'node_modules/foundation-sites/dist/css/foundation.min.css', to: 'assets/foundation.min.css' },
  { from: 'node_modules/foundation-sites/dist/css/foundation.min.css.map', to: 'assets/foundation.min.css.map' }
]);

const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: './src/index.html',
  filename: 'index.html',
  inject: 'body'
});

module.exports = {
  entry: './src/main.ts',
  output: {
    path: path.resolve('docs'),
    filename: '[name].bundle.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      { test: /\.worker\.js$/, use: { loader: 'worker-loader' } },
      { test: /\.tsx?$/, loader: 'ts-loader' },
      { test: /\.css$/, loader: 'style-loader!css-loader' }
    ]
  },
  plugins: [HtmlWebpackPluginConfig, ExternalDepsPlugin]
}
