const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin'); //installed via npm

//new webpack.HotModuleReplacementPlugin()
const title = 'Test-bed time service';

module.exports = {
  mode: 'production',
  entry: {
    app: './src/app.ts',
    // print: './src/print.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, '../../server/public'),
    // publicPath: 'time-service'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1, // 0 => no loaders (default); 1 => postcss-loader; 2 => postcss-loader, sass-loader
            },
          },
          'postcss-loader',
        ],
      },
      {
        test: /\.(gif|png|jpe?g|svg|ico|eot|woff|ttf|svg|woff2)$/i,
        use: [
          'url-loader?limit=8192', // 'file-loader' is used as url-loader fallback anyways
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({ title: title, favicon: './src/assets/favicon.ico' }),
  ],
};
