/**
 * Client development build configuration to be on local development
 *
 * @author Ville Venäläinen
 */

const path = require('path');
const merge = require('webpack-merge');
const commonConf = require('./webpack.config.common');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { TsConfigPathsPlugin, CheckerPlugin } = require('awesome-typescript-loader');
const parts = require('./webpack.parts');

const { resolve } = path;
// const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const TSLintPlugin = require('tslint-webpack-plugin');
const webpack = require('webpack');

const distPath = resolve(__dirname, '../dist');
const indexPath = resolve(distPath, 'index.html');
const basePath = resolve(__dirname, '../src/');

const tsconfigFile = 'tsconfig.development.json';

module.exports = env => {
  return merge(commonConf(env), createDevConf(env));
};

function createDevConf(env) {
  return {
    target: 'web',
    mode: 'development',

    entry: ['./index.tsx'],

    output: {
      filename: 'app.js',
      publicPath: distPath,
      path: distPath,
    },

    module: {
      rules: [parts.typescriptRule(tsconfigFile), parts.svgRule, parts.imageRule],
    },

    devtool: 'source-map',

    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.json'],
      plugins: [
        new TsConfigPathsPlugin({
          configFile: resolve(__dirname, tsconfigFile),
        }),
      ],
    },

    plugins: [
      new HtmlWebpackPlugin({ template: 'index.html' }),
      // new CheckerPlugin(),
      new webpack.NamedModulesPlugin(),
    ],

    /*
     * Make HTML5 routing work on hot reload
     */
    devServer: {
      historyApiFallback: {
        index: indexPath,
      },
      headers: {
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
        'Access-Control-Allow-Origin': '*',
      },
    },

    externals: [
      {
        firebase: 'firebase',
        react: 'React',
      },
    ],

    performance: {
      hints: false,
    },
  };
}
