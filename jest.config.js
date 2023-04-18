module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testMatch: ['**/src/**/*.test.(ts|js)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
};
