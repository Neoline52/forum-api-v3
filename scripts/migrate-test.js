require('dotenv').config();
const { execSync } = require('child_process');

process.env.PGHOST = process.env.PGHOST_TEST;
process.env.PGPORT = process.env.PGPORT_TEST;
process.env.PGUSER = process.env.PGUSER_TEST;
process.env.PGPASSWORD = process.env.PGPASSWORD_TEST;
process.env.PGDATABASE = process.env.PGDATABASE_TEST;

console.log(`Running test database migration for: ${process.env.PGDATABASE}`);
execSync('npm run migrate up', { stdio: 'inherit', env: process.env });
