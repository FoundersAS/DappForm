const webpack = require('webpack');
const merge = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const common = require('./webpack.common.js');

const ManifestPlugin = new CopyWebpackPlugin([
  { from: 'src/assets/manifest.prod.json', to: 'manifest.json' }
]);

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  plugins: [
    ManifestPlugin,
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ]
});
