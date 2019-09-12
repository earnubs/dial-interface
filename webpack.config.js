const { resolve } = require('path');

module.exports = {
  mode: 'development',
  target: 'web',
  entry: {
    main: './src/index.js'
  },
  output: {
    filename: 'dial.js',
    path: resolve(__dirname, 'lib'),
    publicPath: 'lib/'
  },
  stats: 'verbose',
  performance: {
    hints: 'warning'
  },
  resolve: {
    alias: {
      'react-dom$': 'react-dom/profiling',
      'scheduler/tracing': 'scheduler/tracing-profiling',
    }
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: [ 'babel-loader' ],
      exclude: /node_modules/
    },{
      test: /\.worker\.js$/,
      use: [ 'worker-loader' ],
      exclude: /node_modules/
    }]
  }
};
