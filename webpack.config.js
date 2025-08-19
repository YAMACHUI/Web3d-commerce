const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use:{
          loader:'babel-loader',
        }
      },
    
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(glb|gltf)$/,
        use:{
          loader:'file-loader',
          options:{
            outputPath: 'assets/models/',
          }
        }
      }
    ],
  },

  plugins:[
    new HtmlWebpackPlugin({
      template: './public/index.html'
    }),
  ],
  devServer: {
    static: './public',
    open: true,
  },
  mode: 'development'
};
