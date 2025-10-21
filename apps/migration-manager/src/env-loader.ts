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
    console.log(`[migration-manager] Loading environment from: ${envPath}`);
    dotenv.config({ path: envPath });
    loaded = true;
    break;
  }
}

if (!loaded) {
  // eslint-disable-next-line no-console
  console.warn('[migration-manager] No environment file found, using system environment variables');
}

// Log loaded configuration (without sensitive values)
// eslint-disable-next-line no-console
console.log('[migration-manager] Environment configuration:');
// eslint-disable-next-line no-console
console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`);
// eslint-disable-next-line no-console
console.log(`  PORT: ${process.env.PORT || '3334 (default)'}`);
// eslint-disable-next-line no-console
console.log(`  MYSQL_HOST: ${process.env.MYSQL_HOST || 'localhost (default)'}`);
// eslint-disable-next-line no-console
console.log(`  MYSQL_DATABASE: ${process.env.MYSQL_DATABASE || 'main (default)'}`);
// eslint-disable-next-line no-console
console.log(`  MIDDLEWARE_URL_INTERNAL: ${process.env.MIDDLEWARE_URL_INTERNAL || 'NOT SET'}`);
// eslint-disable-next-line no-console
console.log(`  ADMIN_PASSWORD: ${process.env.ADMIN_PASSWORD ? '***SET***' : 'NOT SET'}`);
// eslint-disable-next-line no-console
console.log(`  ADMIN_MIGRATION_PASSWORD: ${process.env.ADMIN_MIGRATION_PASSWORD ? '***SET***' : 'using default'}`);
