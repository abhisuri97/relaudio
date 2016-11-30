var webpack = require('webpack')
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  context: __dirname,
  entry: './index.js',
  output: {
    path: 'public',
    filename: 'bundle.js',
    publicPath: '/'
  },

  module: {
    loaders: [
    { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader?presets[]=es2015&presets[]=react' },
    { test: /\.scss$/, loaders: ["style", "css", "sass"]}
      ,
    {test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
            'file?hash=sha512&digest=hex&name=[hash].[ext]',
        ]
    }
    ]},

  plugins: process.env.NODE_ENV === 'production' ? [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin(),
    new ExtractTextPlugin('./public/styles.css') 
  ] : [],
}
