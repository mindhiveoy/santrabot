module.exports = {
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '@shared/bot': '<rootDir>/../@shared/bot',
    '@shared/schema': '<rootDir>/../@shared/schema',
  },
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.test.json',
    },
  },
  moduleDirectories: ['node_modules', 'src'],
  testRegex: '(/__specs__/.*|(\\.|/)(spec))\\.(jsx?|tsx?)$',
  testPathIgnorePatterns: ['lib', 'node_modules', 'tools'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
