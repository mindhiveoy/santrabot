/**
 * Shared webpack configuration for all builds
 *
 * @author Ville Venäläinen
 */
const path = require('path');
const { resolve } = path;

const parts = require('./webpack.parts');
const webpack = require('webpack');
const ConfigWebpackPlugin = require('config-webpack');
const readPackageVersionNumber = require('./utils/readPackageVersionNo');

module.exports = env => {
  return {
    context: resolve(__dirname, '../src/'),

    module: {
      rules: [
        {
          test: /\.svg$/,
          loader: 'svg-inline-loader',
        },
        parts.cssRule,
        parts.fontRule,
        parts.imageRule,
      ],
    },
    // resolve: {
    //   extensions: ['.tsx', '.ts', '.js', '.json'],
    //   plugins: [new TsconfigPathsPlugin({ configFile: resolve(__dirname, '../tsconfig.json') })],
    // },
    plugins: [new webpack.DefinePlugin({ CONFIG: readConfigFile(env) })],
  };
};

/**
 * Read configuration based on build targed and attach build information to the object.
 *
 * TODO Move to utils
 */
function readConfigFile(env) {
  console.log(JSON.stringify(env));

  const CONFIG_DIR = resolve(__dirname, '..', 'config');

  process.env.NODE_CONFIG_DIR = CONFIG_DIR;
  process.env.NODE_ENV = env.NODE_ENV;

  try {
    const config = require('config');

    const versionNo = readPackageVersionNumber();

    if (
      !config ||
      !config.build ||
      !config.build.environment ||
      (config &&
        config.build &&
        config.build.environment &&
        config.build.environment === 'default' &&
        env.NODE_ENV !== 'default')
    ) {
      console.error(
        `ERROR: No environment defined for ${process.env.NODE_ENV}. Make a ${process.env.NODE_ENV}.json -file with configuration in to ${CONFIG_DIR}-folder.`,
      );
      process.exit(1);
    }

    console.info(`Building for ${config.build.environment} environment...`);

    config.build = {
      ...config.build,
      version: versionNo,
      build: env.CIRCLE_BUILD_NUM ? env.CIRCLE_BUILD_NUM : '-',

      tag: env.CIRCLE_TAG ? env.CIRCLE_TAG : '-',
      sha1: env.CIRCLE_SHA1 ? env.CIRCLE_SHA1 : '-',
      repoName: env.CIRCLE_PR_REPONAME ? env.CIRCLE_PR_REPONAME : '-',
      branch: env.CIRCLE_BRANCH ? env.CIRCLE_BRANCH : '-',
    };

    return JSON.stringify(config);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
