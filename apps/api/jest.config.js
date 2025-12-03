/**
 * Jest Configuration
 * 
 * @author Henry Maobughichi Ugochukwu
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Root directory for tests
  rootDir: './src',
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  
  // Directories to ignore
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  
  // Module file extensions
  moduleFileExtensions: ['js', 'json', 'ts'],
  
  // Transform files
  transform: {
    '^.+\\.ts$': 'ts-jest'
    // JavaScript files don't need transformation in Node.js environment
  },
  
  // Module name mapping (for path aliases)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  
  // Coverage configuration
  collectCoverageFrom: [
    '**/*.{js,ts}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
    '!**/*.config.js',
    '!**/server.js'
  ],
  
  // Coverage thresholds (can be adjusted as tests are added)
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  },
  
  // Setup files
  setupFilesAfterEnv: [],
  
  // Verbose output
  verbose: true,
  
  // Pass with no tests (useful during development)
  passWithNoTests: true
};

