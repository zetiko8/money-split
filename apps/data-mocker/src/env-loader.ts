import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Determine which environment file to use based on NODE_ENV or default
const environment = process.env.NODE_ENV || 'development';

// Define possible environment file paths in order of priority
const envPaths = [
  // 1. Project-specific environment file (e.g., .development.env, .production.env)
  path.resolve(__dirname, `../../.${environment}.env`),
  // 2. Project-specific default .env
  path.resolve(__dirname, '../../.env'),
  // 3. Root environment file
  path.resolve(__dirname, '../../../.env'),
];

// Load the first environment file that exists
let loaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    // eslint-disable-next-line no-console
    console.log(`[data-mocker] Loading environment from: ${envPath}`);
    dotenv.config({ path: envPath });
    loaded = true;
    break;
  }
}

if (!loaded) {
  // eslint-disable-next-line no-console
  console.warn('[data-mocker] No environment file found, using system environment variables');
}

// Log loaded configuration (without sensitive values)
// eslint-disable-next-line no-console
console.log('[data-mocker] Environment configuration:');
// eslint-disable-next-line no-console
console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`);
// eslint-disable-next-line no-console
console.log(`  DATA_MOCKER_PORT: ${process.env.DATA_MOCKER_PORT || '3334 (default)'}`);
// eslint-disable-next-line no-console
console.log(`  MYSQL_HOST: ${process.env.MYSQL_HOST || 'localhost (default)'}`);
// eslint-disable-next-line no-console
console.log(`  MYSQL_DATABASE: ${process.env.MYSQL_DATABASE || 'main (default)'}`);
// eslint-disable-next-line no-console
console.log(`  JWT_SECRET: ${process.env.JWT_SECRET ? '***SET***' : 'using default'}`);
