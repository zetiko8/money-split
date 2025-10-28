#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

/**
 * Generates the frontend config.json file from environment variables
 */
function generateFrontendConfig() {
  const rootDir = path.resolve(__dirname, '..');
  const configPath = path.join(rootDir, 'apps', 'money-split', 'src', 'assets', 'config', 'config.json');
  const configTplPath = path.join(rootDir, 'apps', 'money-split', 'src', 'assets', 'config', 'config.tpl.json');

  // Check if .env exists
  const envPath = path.join(rootDir, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found!');
    console.error(`   Expected location: ${envPath}`);
    console.error('   Run: npm run generate-env');
    process.exit(1);
  }

  // Check if template exists
  if (!fs.existsSync(configTplPath)) {
    console.error('❌ config.tpl.json template not found!');
    console.error(`   Expected location: ${configTplPath}`);
    process.exit(1);
  }

  // Get MIDDLEWARE_URL from environment
  const middlewareUrl = process.env.MIDDLEWARE_URL;
  if (!middlewareUrl) {
    console.error('❌ MIDDLEWARE_URL not found in .env file!');
    console.error('   Please ensure .env file contains MIDDLEWARE_URL');
    process.exit(1);
  }

  // Read template
  let configContent = fs.readFileSync(configTplPath, 'utf-8');

  // Replace placeholder with actual value
  configContent = configContent.replace('${MIDDLEWARE_URL}', middlewareUrl);

  // Ensure config directory exists
  const configDir = path.dirname(configPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  // Write config.json
  fs.writeFileSync(configPath, configContent, 'utf-8');

  console.log('✅ Successfully generated frontend config.json!');
  console.log(`   Location: ${configPath}`);
  console.log('');
  console.log('📋 Configuration:');
  console.log(`   MIDDLEWARE_URL: ${middlewareUrl}`);
}

// Run the script
try {
  generateFrontendConfig();
} catch (error) {
  console.error('❌ Error generating frontend config:', error.message);
  process.exit(1);
}
