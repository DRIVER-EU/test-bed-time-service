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
  externals: [
      {
        'utf-8-validate': 'commonjs utf-8-validate',
        bufferutil: 'commonjs bufferutil',
      },
    ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
	  {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
	  /*
      {
        test: /\.css$/i,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  [
                    "postcss-preset-env",
                    {
                      // Options
                    },
                  ],
                ],
              },
            },
          },
        ],
      },*/
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
