module.exports = {
  roots: ['<rootDir>/colavo/src'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/colavo/src/$1',
  },
  testEnvironment: 'node',
  transformIgnorePatterns: ['node_modules/(?!(dayjs)/)'],
};
