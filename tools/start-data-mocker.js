#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env');

/**
 * Check if Docker is running
 */
function isDockerRunning() {
  try {
    execSync('docker info', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if .env file exists
 */
function envExists() {
  return fs.existsSync(envPath);
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
 * Start the data-mocker in development mode
 */
function startDataMocker() {
  console.log('\n🚀 Starting data-mocker...\n');
  const child = spawn('npm', ['run', 'dev:data-mocker'], {
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

  const dockerRunning = isDockerRunning();
  const hasEnv = envExists();

  console.log(`   Docker running: ${dockerRunning ? '✅' : '❌'}`);
  console.log(`   .env exists: ${hasEnv ? '✅' : '❌'}`);

  // If Docker is not running or .env doesn't exist, run full setup
  if (!dockerRunning || !hasEnv) {
    console.log('\n⚠️  Prerequisites not met. Running full setup...');
    runCommand('npm run setup', 'Full setup');
  } else {
    // Prerequisites met, just run migrations and procedures
    console.log('\n✅ Prerequisites met. Running migrations and procedures...');
    runCommand('npm run db:migrate', 'Database migration');
    runCommand('npm run db:procedures', 'Database procedures');
  }

  // Start the data-mocker
  startDataMocker();
}

// Run the script
main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
