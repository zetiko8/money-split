#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

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
 * Start a server in a separate process
 */
function startServer(command, name) {
  console.log(`\n🚀 Starting ${name}...`);
  
  const child = spawn('npm', ['run', command], {
    stdio: 'inherit',
    shell: true,
    cwd: rootDir
  });

  child.on('exit', (code) => {
    console.error(`\n❌ ${name} exited with code ${code}`);
    process.exit(code);
  });

  return child;
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

  // Generate frontend config
  console.log('\n🔄 Generating frontend config...');
  runCommand('npm run generate-frontend-config', 'Frontend config generation');

  console.log('\n🚀 Starting development servers...\n');

  // Start all servers
  const dataProvider = startServer('dev:data-provider', 'data-provider');
  const dataMocker = startServer('dev:data-mocker', 'data-mocker');
  
  // Start frontend with port from .env
  const frontendPort = process.env.FRONTEND_PORT || '4200';
  console.log(`\n🚀 Starting money-split frontend on port ${frontendPort}...`);
  const frontend = spawn('npx', ['nx', 'run', 'money-split:serve:development', `--port=${frontendPort}`], {
    stdio: 'inherit',
    shell: true,
    cwd: rootDir
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down servers...');
    dataProvider.kill();
    dataMocker.kill();
    frontend.kill();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n\n🛑 Shutting down servers...');
    dataProvider.kill();
    dataMocker.kill();
    frontend.kill();
    process.exit(0);
  });
}

// Run the script
main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
