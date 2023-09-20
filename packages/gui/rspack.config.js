const path = require('path');
const devMode = process.env.NODE_ENV === 'development';
const outputPath = path.resolve(__dirname, devMode ? 'dist' : '../server/public');

console.log(`Working in ${devMode ? 'development' : 'production'} mode.`);

module.exports = {
  mode: devMode ? 'development' : 'production',
  entry: {
    main: './src/app.ts',
  },
  devServer: {
    port: 8100,
  },
  builtins: {
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      SOCKET_IO_SERVER: JSON.stringify(devMode ? 'localhost:2347' : ''),
    },
    html: [
      {
        title: 'Time service',
        publicPath: '',
        scriptLoading: 'defer',
        minify: !devMode,
        favicon: './src/assets/favicon.ico',
        meta: {
          viewport: 'width=device-width, initial-scale=1',
          'og:title': 'Time service',
          'og:description':
            'Control and display the simulation time. Can also be used to show billboard messages, or play video.',
          'og:url': 'https://github.com/DRIVER-EU/test-bed-time-service',
          'og:site_name': 'Time Service',
          'og:image:alt': 'Time Service',
          'og:image': './src/assets/logo/logo.png',
          'og:image:type': 'image/png',
          'og:image:width': '200',
          'og:image:height': '200',
        },
      },
    ],
    minifyOptions: devMode
      ? undefined
      : {
          passes: 3,
          dropConsole: false,
        },
  },
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|jpeg|gif|webp)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      {
        test: /^BUILD_ID$/,
        type: 'asset/source',
      },
    ],
  },
  output: {
    filename: 'main.js',
    path: outputPath,
  },
};
