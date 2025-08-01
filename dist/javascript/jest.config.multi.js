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
      testTimeout: 30000,
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
      testTimeout: 60000, // Longer timeout for browser tests
      setupFilesAfterEnv: ['<rootDir>/src/__tests__/browser-setup.ts'],
    }
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
  ],
  verbose: true
};
