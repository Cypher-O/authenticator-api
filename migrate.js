// //migrate.js
require('dotenv').config();
const { spawn } = require('child_process');

const encodedUrl = encodeURIComponent(process.env.DATABASE_URL);

const migrate = spawn('node-pg-migrate', ['up'], {
  env: { ...process.env, DATABASE_URL: encodedUrl },
});

migrate.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

migrate.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

migrate.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});