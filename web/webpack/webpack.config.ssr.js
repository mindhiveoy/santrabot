/**
 * Server side rendering -configuration to be build renderer code for Firebase function to that
 * will render the initial page for user when accessing the site.
 *
 * @author Ville Venäläinen
 */
const path = require('path');
const merge = require('webpack-merge');
const commonConf = require('./webpack.config.common.js');
const nodeExternals = require('webpack-node-externals');

const { resolve } = path;
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const TSLintPlugin = require('tslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const UglifyWebpackPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const cssnano = require('cssnano');
const mergeCloudPackages = require('./utils/mergeCloudPackages');
const parts = require('./webpack.parts');

module.exports = env => {
  mergeCloudPackages();

  return merge(commonConf(env), {
    target: 'node',
    mode: 'production',
    entry: './server/renderer.tsx',
    context: resolve(__dirname, '../src/'),
    output: {
      filename: 'renderer.bundle.js',
      libraryTarget: 'commonjs2',
      path: resolve(__dirname, '../../backend/src'),
    },
    devtool: 'source-map',

    module: {
      strictExportPresence: true,
      rules: [parts.typescriptRule],
    },

    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.json'],
      plugins: [
        new TsconfigPathsPlugin({
          configFile: resolve(__dirname, '../tsconfig.ssr.json'),
        }),
      ],
    },

    plugins: [
      new OptimizeCSSAssetsPlugin({
        cssProcessor: cssnano,
        cssProcessorOptions: {
          discardComments: {
            removeAll: true,
          },
          safe: true,
        },
        canPrint: false,
      }),
    ],

    optimization: {
      minimizer: [new UglifyWebpackPlugin({ sourceMap: false })],
    },

    performance: {
      hints: 'warning',
    },

    externals: [
      nodeExternals({
        whitelist: require('./whitelist'),
      }),
    ],
  });
};
