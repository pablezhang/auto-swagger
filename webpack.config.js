'use strict';
const NodemonPlugin  = require('nodemon-webpack-plugin');
module.exports = (env = {}) => {
  let config = {
    entry: ['./src/cli.ts'],
    output: {
      filename: "index.js"
    },
    mode: 'development',
    target: 'node',
    devtool: env.development ? 'cheap-eval-source-map' : false,
    resolve: { // tells Webpack what files to watch.
      extensions: ['.ts', '.js'],
      modules: ['node_modules', 'src', 'package.json'],
    },
    plugins: [],
    module: {
      // require
      unknownContextRegExp: /$^/,
      unknownContextCritical: false,

      // require(expr)
      exprContextRegExp: /$^/,
      exprContextCritical: false,

      // require("prefix" + expr + "surfix")
      wrappedContextRegExp: /$^/,
      wrappedContextCritical: false,
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
        },
      ],
    }
  };

  if(env.nodemon){
    config.watch = true;
    config.plugins.push(new NodemonPlugin);
  }
  return config;
};