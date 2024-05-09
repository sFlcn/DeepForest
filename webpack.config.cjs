const path = require('path');

module.exports = {
  entry: './source/js/script.js',
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'build/js'),
    filename: 'scripts.bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { presets: [['@babel/preset-env']] },
        },
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
};
