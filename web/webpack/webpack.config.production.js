/**
 * Client production build configuration to be used for production and staging
 *
 * @author Ville Venäläinen
 */
const path = require('path');
const merge = require('webpack-merge');
const commonConfig = require('./webpack.config.common.js');
const parts = require('./webpack.parts');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TSLintPlugin = require('tslint-webpack-plugin');
const webpack = require('webpack');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const cssnano = require('cssnano');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const OptimizeJsPlugin = require('optimize-js-plugin');
const nodeExternals = require('webpack-node-externals');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const { resolve } = path;
const distPath = resolve(__dirname, '../dist');


const tsconfigFile = 'tsconfig.production.json';

const externals = [
  {
    firebase: 'firebase',
    react: 'React',
  },
];

function createChatClientConf(env) {
  return {
    target: 'web',
    mode: 'production',
    entry: ['./chat-client/index.tsx'],
    devtool: 'source-map',
    output: {
      filename: 'js/chat-client.min.js',
      publicPath: '/',
      path: distPath,
    },

    module: {
      rules: [parts.typescriptRule(tsconfigFile), parts.svgRule, parts.imageRule],
    },

    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.json'],

      plugins: [
        new TsconfigPathsPlugin({
          configFile: resolve(__dirname, '../tsconfig.production.json'),
        }),
      ],
    },

    plugins: [
      new webpack.DefinePlugin({
        __isBrowser__: 'true',
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
    ],

    optimization: {
      minimize: true,
      minimizer: [
        new TerserJSPlugin({
          extractComments: true,
          sourceMap: true,
          parallel: 4,
        }),
        new OptimizeCSSAssetsPlugin({}),
      ],
    },
  };
}

function createDashboardClientConf(env) {
  return {
    target: 'web',
    mode: 'production',
    entry: './index.tsx',
    context: resolve(__dirname, '../src/'),
    devtool: 'source-map',

    output: {
      filename: 'js/[name].bundle.min.js',
      publicPath: '/',
      path: distPath,
    },

    module: {
      rules: [parts.typescriptRule(tsconfigFile), parts.svgRule, parts.imageRule],
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: 'index.production.html',
      }),

      new webpack.DefinePlugin({
        __isBrowser__: 'true',
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
    ],

    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.json'],
      plugins: [
        new TsconfigPathsPlugin({
          configFile: resolve(__dirname, '../tsconfig.production.json'),
        }),
      ],
    },

    optimization: {
      minimizer: [
        new TerserJSPlugin({
          extractComments: true,
          sourceMap: true,
          parallel: 4,
        }),
        new OptimizeCSSAssetsPlugin({}),
      ],
      // splitChunks: {
      //   chunks: 'all',
      // },
    },

    externals,
  };
}

module.exports = env => {
  return [
    merge(commonConfig(env), createChatClientConf(env)),
    merge(commonConfig(env), createDashboardClientConf(env)),
  ];
};
