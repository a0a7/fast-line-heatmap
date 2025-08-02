module.exports = {
  // Node.js tests configuration
  projects: [
    {
      displayName: 'node',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['**/__tests__/**/*.node.test.ts'],
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
      },
      moduleNameMapper: {
        '\\.(wasm)$': 'identity-obj-proxy',
        '^(\\.{1,2}/.*)\\.js$': '$1',
      },
      testRunner: 'jest-circus/runner',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      globals: {
        'ts-jest': {
          isolatedModules: true,
        },
      },
    },
    // Browser tests configuration
    {
      displayName: 'browser',
      preset: 'ts-jest',
      testEnvironment: 'node', // We use node to run Puppeteer
      testMatch: ['**/__tests__/**/*.browser.test.ts'],
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
      },
      setupFilesAfterEnv: ['<rootDir>/src/__tests__/browser-setup.ts'],
      testRunner: 'jest-circus/runner',
      globals: {
        'ts-jest': {
          isolatedModules: true,
        },
      },
    }
  ],
  // Global timeout for all tests  
  testTimeout: 60000,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
  ],
  verbose: true
};
