#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Generates a random string of specified length
 */
function generateRandomString(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generates a random password
 */
function generatePassword(length = 16) {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

/**
 * Generates a random port number in a safe range
 */
function generatePort(min = 3000, max = 9999) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Main function to generate .env file
 */
function generateEnvFile() {
  const rootDir = path.resolve(__dirname, '..');
  const envPath = path.join(rootDir, '.env');
  const envExamplePath = path.join(rootDir, '.env.example');

  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    const forceFlag = process.argv.includes('--force') || process.argv.includes('-f');
    
    if (!forceFlag) {
      console.log('⚠️  .env file already exists!');
      console.log('   To overwrite, run with --force flag:');
      console.log('   npm run generate-env -- --force');
      console.log(`   Location: ${envPath}`);
      process.exit(1);
    }
    
    console.log('⚠️  Overwriting existing .env file...');
  }

  // Check if .env.example exists
  if (!fs.existsSync(envExamplePath)) {
    console.error('❌ .env.example file not found!');
    console.error(`   Expected location: ${envExamplePath}`);
    process.exit(1);
  }

  // Generate random values
  const apiPort = generatePort(3000, 9000);
  const mysqlPort = generatePort(10000, 19999);
  
  const randomValues = {
    MYSQL_PASSWORD: generatePassword(16),
    JWT_SECRET: generateRandomString(32),
    ADMIN_PASSWORD: generatePassword(16),
    ADMIN_USERNAME: 'admin',
    ADMIN_MIGRATION_PASSWORD: generatePassword(16),
    PORT: apiPort.toString(),
    MYSQL_PORT: mysqlPort.toString(),
    MYSQL_HOST: 'localhost',
    MYSQL_USER: 'root',
    MYSQL_DATABASE: 'main',
    MIDDLEWARE_URL: `http://localhost:${apiPort}/data-provider`,
    MIDDLEWARE_URL_INTERNAL: `http://localhost:${apiPort}/data-provider`,
    NODE_ENV: 'development',
    TZ: 'Europe/Amsterdam',
    DOCKER_CONTAINER_NAME: `money-split-db-${generateRandomString(4)}`,
  };

  // Read .env.example
  let envContent = fs.readFileSync(envExamplePath, 'utf-8');

  // Replace values
  Object.entries(randomValues).forEach(([key, value]) => {
    const regex = new RegExp(`^${key}=.*$`, 'gm');
    envContent = envContent.replace(regex, `${key}=${value}`);
  });

  // Write .env file
  fs.writeFileSync(envPath, envContent, 'utf-8');

  console.log('✅ Successfully generated .env file!');
  console.log(`   Location: ${envPath}`);
  console.log('');
  console.log('📋 Generated credentials:');
  console.log(`   ADMIN_USERNAME: ${randomValues.ADMIN_USERNAME}`);
  console.log(`   ADMIN_PASSWORD: ${randomValues.ADMIN_PASSWORD}`);
  console.log(`   MYSQL_PASSWORD: ${randomValues.MYSQL_PASSWORD}`);
  console.log(`   JWT_SECRET: ${randomValues.JWT_SECRET.substring(0, 16)}...`);
  console.log(`   ADMIN_MIGRATION_PASSWORD: ${randomValues.ADMIN_MIGRATION_PASSWORD}`);
  console.log('');
  console.log('📋 Generated ports:');
  console.log(`   API PORT: ${randomValues.PORT}`);
  console.log(`   MYSQL_PORT: ${randomValues.MYSQL_PORT}`);
  console.log(`   MIDDLEWARE_URL: ${randomValues.MIDDLEWARE_URL}`);
  console.log('');
  console.log('🐳 Docker:');
  console.log(`   DOCKER_CONTAINER_NAME: ${randomValues.DOCKER_CONTAINER_NAME}`);
  console.log('');
  console.log('⚠️  Keep these credentials secure!');
}

// Run the script
try {
  generateEnvFile();
} catch (error) {
  console.error('❌ Error generating .env file:', error.message);
  process.exit(1);
}
