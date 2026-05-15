module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/_test/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/app.js',
    '!src/Infrastructures/database/postgres/pool.js',
  ],
};
