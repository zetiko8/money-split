import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

import { defineConfig } from 'cypress';

// Helper function to load environment with fallback
function loadEnvWithFallback(envFileName: string) {
  const projectEnvPath = path.resolve(__dirname, envFileName);
  const rootEnvPath = path.resolve(__dirname, '../../.env');

  if (fs.existsSync(projectEnvPath)) {
    // eslint-disable-next-line no-console
    console.log(`[money-split-e2e] Loading ${envFileName} from project directory`);
    return dotenv.config({ path: projectEnvPath }).parsed;
  } else if (fs.existsSync(rootEnvPath)) {
    // eslint-disable-next-line no-console
    console.log(`[money-split-e2e] Loading from root .env (${envFileName} not found)`);
    return dotenv.config({ path: rootEnvPath }).parsed;
  } else {
    // eslint-disable-next-line no-console
    console.warn(`[money-split-e2e] No environment file found for ${envFileName}`);
    return {};
  }
}

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, { cypressDir: 'src' }),
    viewportWidth: 360,
  },
  env: {
    development: loadEnvWithFallback('./.development.env'),
    ['production-local']: loadEnvWithFallback('./.production-local.env'),
  },
});
