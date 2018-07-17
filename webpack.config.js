'use strict';
const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const ManifestAssetPlugin = new CopyWebpackPlugin([{ from: 'src/assets/manifest.json', to: 'manifest.json' }]);
const IconAssetPlugin = new CopyWebpackPlugin([{ from: 'src/assets/icon.png', to: 'assets/icon.png' }]);
const ExternalDepsPlugin = new CopyWebpackPlugin([
  { from: 'node_modules/foundation-sites/dist/css/foundation.min.css', to: 'assets/foundation.min.css' },
  { from: 'node_modules/foundation-sites/dist/css/foundation.min.css.map', to: 'assets/foundation.min.css.map' },
  { from: 'node_modules/blockstack/dist/blockstack.js', to: 'assets/blockstack.js' }
]);

const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: './src/index.html',
  filename: 'index.html',
  inject: 'body'
});

module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: "./src/main.ts",
  output: {
    path: path.resolve('public/build'),
    filename: "bundle.js"
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      css: path.resolve('node_modules/foundation-sites/dist/css/foundation.css')
    }
  },
  devServer: {
    host: '127.0.0.1',
    port: 8080,
    historyApiFallback: true,
    watchOptions: { aggregateTimeout: 300, poll: 1000 },
    disableHostCheck: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
    },
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.worker\.js$/, use: { loader: "worker-loader" } },
      { test: /\.tsx?$/, loader: "ts-loader" },
      {
        test: /\.(eot|woff|woff2|ttf|svg|png|jpe?g|gif)(\?\S*)?$/,
        loader: 'file-loader!url-loader',
      },
      { test: /\.css$/, loader: 'style-loader!css-loader' }
    ]
  },
  plugins: [HtmlWebpackPluginConfig, ManifestAssetPlugin, IconAssetPlugin, ExternalDepsPlugin]
}
