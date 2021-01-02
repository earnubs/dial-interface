const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const CssWorkletPlugin = require('css-worklet-plugin');
const WorkerPlugin = require('worker-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { resolve } = require('path');

module.exports = (env = {})=> {
  const isDev = env.development;
  
  return {
    mode: isDev ? 'development' : 'production',
    target: 'web',
    entry: {
      main: './src/index.js'
    },
    output: {
      filename: isDev ? '[name].bundle.js' : '[name].[hash].js',
      path: resolve(__dirname, 'dist'),
      globalObject: 'this'
    },
    devtool: isDev ? 'inline-source-map' : false,
    devServer: {
      contentBase: './dist'
    },
    optimization: {
      minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: isDev ? '[name].css' : '[name].[hash].css',
        chunkFilename: isDev ? '[id].css' : '[id].[hash].css',
      }),
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        title: 'Development',
        template: 'src/index.html',
      }),
      new CssWorkletPlugin(),
      new WorkerPlugin()
    ],
    stats: {
      all: false,
      assets: true,
      builtAt: true,
      errorDetails: true,
      errors: true,
      performance: true,
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
      }, {
        test: /\.css$/i,
        use: [{
          loader: MiniCssExtractPlugin.loader,
          options: {
            hmr: process.env.NODE_ENV === 'development',
          }
        }, 'css-loader'],
      }]
    }
  };
};
