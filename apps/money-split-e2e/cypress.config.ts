import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import * as dotenv from 'dotenv';

import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, { cypressDir: 'src' }),
    viewportWidth: 360,
  },
  env: {
    development: dotenv.config({
      path: './.development.env',
    }).parsed,
    ['production-local']: dotenv.config({
      path: './.production-local.env',
    }).parsed,
  },
});
