#!/usr/bin/env node

/**
 * Copies `.env.example` to `.env.local` for local development.
 */

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const examplePath = path.join(root, '.env.example');
const localPath = path.join(root, '.env.local');

function showHelp() {
  console.log(`Environment helper

Usage:
  node scripts/setup-env.js init       Create .env.local from .env.example (skips if .env.local exists)
  node scripts/setup-env.js validate   Verify .env.local or .env exists
  node scripts/setup-env.js list        Show template and local file status
  node scripts/setup-env.js help        This message
`);
}

function cmdInit() {
  if (!fs.existsSync(examplePath)) {
    console.error('Missing .env.example in project root.');
    process.exit(1);
  }
  if (fs.existsSync(localPath)) {
    console.log('.env.local already exists; not overwriting.');
    return;
  }
  fs.copyFileSync(examplePath, localPath);
  console.log('Created .env.local from .env.example — edit values before running the app.');
}

function cmdValidate() {
  const hasLocal = fs.existsSync(localPath);
  const hasEnv = fs.existsSync(path.join(root, '.env'));
  if (!hasLocal && !hasEnv) {
    console.error('No .env.local or .env found. Run: npm run env:init');
    process.exit(1);
  }
  console.log(hasLocal ? '.env.local present.' : '.env present.');
}

function cmdList() {
  console.log(`Template: ${examplePath}  ${fs.existsSync(examplePath) ? 'ok' : 'missing'}`);
  console.log(`Local:    ${localPath}  ${fs.existsSync(localPath) ? 'ok' : 'missing'}`);
}

const command = process.argv[2] || 'help';

switch (command) {
  case 'init':
    cmdInit();
    break;
  case 'validate':
    cmdValidate();
    break;
  case 'list':
    cmdList();
    break;
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
  default:
    console.error(`Unknown command: ${command}`);
    showHelp();
    process.exit(1);
}
