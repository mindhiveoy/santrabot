const fs = require('fs');
const path = require('path');
const { defaults: tsjPreset } = require('ts-jest/presets');

module.exports = {
  roots: ['<rootDir>/src'],
  testEnvironment: 'jsdom',
  preset: 'ts-jest',
  transform: {
    ...tsjPreset.transform,
  },
  setupFilesAfterEnv: ['<rootDir>/test-setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.test.json',
    },
  },
  /** Include src to module directories to support baseUrl */
  moduleDirectories: ['node_modules', 'src'],
  testMatch: ['**/__specs__/*.spec.(ts|tsx)'],
  collectCoverage: true,
  coverageReporters: ['json', 'lcov'],
  moduleNameMapper: {
    '\\.(css|scss|less)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/src/__mocks__/mockAsset.ts',
    '@shared/(.*)': '<rootDir>/../@shared/$1',
  },
  verbose: true,
};

/**
 * Generate a module mappings for a single folder
 *
 * @param {*} relativePath Relative path to folder from the root of project
 * @param {string} [mappendPathPrefix=''] path shift to be prefixed before module name relative to project's root dir
 * @returns a mapping object containing mappings for modules
 */
function generateModuleMappings(relativePath, importPathPrefix, mappendPathPrefix = '') {
  const result = {};

  const files = fs.readdirSync(path.resolve(__dirname, relativePath));
  for (const file of files) {
    if (!file.includes('.') && !file.includes('__')) {
      result[importPathPrefix + file] = '<rootDir>/' + mappendPathPrefix + file;
    }
  }
  console.log(JSON.stringify(result, undefined, 2));
  return result;
}
