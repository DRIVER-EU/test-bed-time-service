const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  optimization: {
    usedExports: true,
    splitChunks: {
      chunks: 'all',
    },
  },
  // devServer: {
  //   contentBase: '../../server/public/',
  //   historyApiFallback: true,
  //   // hot: true,
  //   inline: true,
  //   port: 8081,
  //   progress: true,
  //   stats: {
  //     cached: false,
  //   },
  // },
});
