#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env');
const configPath = path.join(rootDir, 'apps', 'money-split', 'src', 'assets', 'config', 'config.json');

/**
 * Check if .env file exists
 */
function envExists() {
  return fs.existsSync(envPath);
}

/**
 * Check if config.json exists
 */
function configExists() {
  return fs.existsSync(configPath);
}

/**
 * Run a command and wait for it to complete
 */
function runCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: rootDir });
    console.log(`✅ ${description} completed`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed`);
    process.exit(1);
  }
}

/**
 * Start the frontend in development mode
 */
function startFrontend() {
  const frontendPort = process.env.FRONTEND_PORT || '4200';
  
  console.log('\n🚀 Starting money-split frontend...');
  console.log(`   Port: ${frontendPort}\n`);
  
  const child = spawn('npx', ['nx', 'run', 'money-split:serve:development', `--port=${frontendPort}`], {
    stdio: 'inherit',
    shell: true,
    cwd: rootDir
  });

  child.on('exit', (code) => {
    process.exit(code);
  });
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Checking prerequisites...\n');

  const hasEnv = envExists();
  const hasConfig = configExists();

  console.log(`   .env exists: ${hasEnv ? '✅' : '❌'}`);
  console.log(`   config.json exists: ${hasConfig ? '✅' : '❌'}`);

  // If .env doesn't exist, we need to generate it
  if (!hasEnv) {
    console.log('\n⚠️  .env file not found. Please run setup first:');
    console.log('   npm run setup');
    console.log('   or');
    console.log('   npm run generate-env');
    process.exit(1);
  }

  // Always generate frontend config to ensure it's up to date with .env
  console.log('\n🔄 Generating frontend config...');
  runCommand('npm run generate-frontend-config', 'Generate frontend config');

  console.log('\n✅ Prerequisites met. Starting frontend...');

  // Start the frontend
  startFrontend();
}

// Run the script
main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
