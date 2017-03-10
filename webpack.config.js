const { resolve } = require('path');

module.exports = {
  target: 'web',
  entry: {
    main: './src/index.js'
  },
  output: {
    filename: 'dial.js',
    path: resolve(__dirname, 'lib')
  },
  stats: 'verbose',
  performance: {
    hints: 'warning'
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: [ 'babel-loader' ],
      exclude: /node_modules/
    }]
  }
};
