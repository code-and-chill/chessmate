module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/app'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/app/$1',
    "^@/(.*)$": "<rootDir>/app/$1"
  },
  transformIgnorePatterns: ['node_modules/(?!expo|@react-native|react-native-reanimated)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['/node_modules/', '/.idea/'],
};
