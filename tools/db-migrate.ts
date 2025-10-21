#!/usr/bin/env ts-node

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { DatabaseMigrationManager, DbConfig } from './db-migrate-lib';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

// Load environment variables
function loadEnv() {
  const rootDir = path.resolve(__dirname, '..');
  const envPath = path.join(rootDir, '.env');

  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(`${colors.gray}[Loaded .env from: ${envPath}]${colors.reset}\n`);
  } else {
    console.log(`${colors.yellow}⚠️  No .env file found. Using system environment variables.${colors.reset}\n`);
  }
}

// Get database configuration from environment
function getDbConfig(): DbConfig {
  return {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'anze123',
    database: process.env.MYSQL_DATABASE || 'main',
    port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 13308,
  };
}

// Get paths to migrations and procedures
function getPaths() {
  const rootDir = path.resolve(__dirname, '..');
  return {
    migrations: path.join(rootDir, 'apps/migration-manager/src/assets/migrations'),
    procedures: path.join(rootDir, 'apps/migration-manager/src/assets/procedures'),
  };
}

// Print help message
function printHelp() {
  console.log(`
${colors.bright}${colors.cyan}Database Migration CLI${colors.reset}

${colors.bright}Usage:${colors.reset}
  npm run db:migrate [command] [options]

${colors.bright}Commands:${colors.reset}
  ${colors.green}migrate${colors.reset}         Run all pending migrations
  ${colors.green}migrate:all${colors.reset}     Run all migrations (force)
  ${colors.green}migrate:down${colors.reset}    Rollback last migration
  ${colors.green}procedures${colors.reset}      Run all stored procedures
  ${colors.green}status${colors.reset}          Show migration status
  ${colors.green}reset${colors.reset}           Rollback all migrations
  ${colors.green}fresh${colors.reset}           Reset + migrate + procedures (fresh setup)
  ${colors.green}help${colors.reset}            Show this help message

${colors.bright}Options:${colors.reset}
  ${colors.yellow}--dry-run${colors.reset}       Show what would be executed without running
  ${colors.yellow}--verbose${colors.reset}       Show detailed output

${colors.bright}Examples:${colors.reset}
  npm run db:migrate              # Run pending migrations
  npm run db:migrate status       # Check migration status
  npm run db:migrate fresh        # Fresh database setup
  npm run db:migrate -- --dry-run # Dry run mode

${colors.bright}Environment:${colors.reset}
  Database configuration is loaded from root .env file
  Run 'npm run generate-env' to create a new .env file
`);
}

// Main CLI function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'migrate';
  const options = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
  };

  if (command === 'help' || args.includes('--help') || args.includes('-h')) {
    printHelp();
    return;
  }

  loadEnv();

  const config = getDbConfig();
  const paths = getPaths();

  console.log(`${colors.bright}${colors.blue}🗄️  Database Migration Manager${colors.reset}\n`);
  console.log(`${colors.gray}Database: ${config.database}@${config.host}:${config.port}${colors.reset}`);
  console.log(`${colors.gray}Command: ${command}${colors.reset}`);
  if (options.dryRun) {
    console.log(`${colors.yellow}Mode: DRY RUN (no changes will be made)${colors.reset}`);
  }
  console.log('');

  const manager = new DatabaseMigrationManager(config, paths.migrations, paths.procedures);

  try {
    await manager.connect();
    console.log(`${colors.green}✓${colors.reset} Connected to database\n`);

    switch (command) {
      case 'migrate':
        await handleMigrate(manager, options);
        break;

      case 'migrate:all':
        await handleMigrateAll(manager, options);
        break;

      case 'migrate:down':
        await handleMigrateDown(manager, options);
        break;

      case 'procedures':
        await handleProcedures(manager, options);
        break;

      case 'status':
        await handleStatus(manager);
        break;

      case 'reset':
        await handleReset(manager, options);
        break;

      case 'fresh':
        await handleFresh(manager, options);
        break;

      default:
        console.log(`${colors.red}❌ Unknown command: ${command}${colors.reset}`);
        console.log(`Run 'npm run db:migrate help' for usage information\n`);
        process.exit(1);
    }

    await manager.disconnect();
    console.log(`\n${colors.green}✓${colors.reset} Disconnected from database`);
    console.log(`${colors.green}${colors.bright}✅ Done!${colors.reset}\n`);
  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}❌ Error:${colors.reset} ${error.message}`);
    if (options.verbose && error.stack) {
      console.error(`\n${colors.gray}${error.stack}${colors.reset}`);
    }
    if ((error as any).details) {
      console.error(`\n${colors.yellow}SQL Details:${colors.reset}\n${(error as any).details}`);
    }
    await manager.disconnect();
    process.exit(1);
  }
}

async function handleMigrate(manager: DatabaseMigrationManager, options: any) {
  console.log(`${colors.cyan}Running pending migrations...${colors.reset}\n`);

  if (options.dryRun) {
    const migrations = await manager.getAllMigrations();
    const pending = migrations.filter((m) => !m.isApplied);
    if (pending.length === 0) {
      console.log(`${colors.gray}No pending migrations${colors.reset}`);
    } else {
      console.log(`${colors.yellow}Would run ${pending.length} migration(s):${colors.reset}`);
      pending.forEach((m) => console.log(`  - ${m.id}`));
    }
    return;
  }

  const executed = await manager.runAllPendingMigrations();

  if (executed.length === 0) {
    console.log(`${colors.gray}No pending migrations${colors.reset}`);
  } else {
    console.log(`${colors.green}✓${colors.reset} Executed ${executed.length} migration(s):`);
    executed.forEach((id) => console.log(`  ${colors.green}✓${colors.reset} ${id}`));
  }
}

async function handleMigrateAll(manager: DatabaseMigrationManager, options: any) {
  console.log(`${colors.cyan}Running all migrations...${colors.reset}\n`);

  if (options.dryRun) {
    const migrations = await manager.getAllMigrations();
    console.log(`${colors.yellow}Would run ${migrations.length} migration(s):${colors.reset}`);
    migrations.forEach((m) => console.log(`  - ${m.id} ${m.isApplied ? '(already applied)' : ''}`));
    return;
  }

  const executed = await manager.runAllMigrations();

  if (executed.length === 0) {
    console.log(`${colors.gray}All migrations already applied${colors.reset}`);
  } else {
    console.log(`${colors.green}✓${colors.reset} Executed ${executed.length} migration(s):`);
    executed.forEach((id) => console.log(`  ${colors.green}✓${colors.reset} ${id}`));
  }
}

async function handleMigrateDown(manager: DatabaseMigrationManager, options: any) {
  console.log(`${colors.cyan}Rolling back last migration...${colors.reset}\n`);

  if (options.dryRun) {
    const migrations = await manager.getAllMigrations();
    const applied = migrations.filter((m) => m.isApplied);
    if (applied.length === 0) {
      console.log(`${colors.gray}No migrations to rollback${colors.reset}`);
    } else {
      const last = applied[applied.length - 1];
      console.log(`${colors.yellow}Would rollback: ${last.id}${colors.reset}`);
    }
    return;
  }

  const rolledBack = await manager.rollbackLastMigration();

  if (!rolledBack) {
    console.log(`${colors.gray}No migrations to rollback${colors.reset}`);
  } else {
    console.log(`${colors.green}✓${colors.reset} Rolled back: ${rolledBack}`);
  }
}

async function handleProcedures(manager: DatabaseMigrationManager, options: any) {
  console.log(`${colors.cyan}Running stored procedures...${colors.reset}\n`);

  const procedures = await manager.getAllProcedures();

  if (options.dryRun) {
    console.log(`${colors.yellow}Would run ${procedures.length} procedure(s):${colors.reset}`);
    procedures.forEach((p) => console.log(`  - ${p}`));
    return;
  }

  const executed = await manager.runAllProcedures();

  console.log(`${colors.green}✓${colors.reset} Executed ${executed.length} procedure(s):`);
  executed.forEach((name) => console.log(`  ${colors.green}✓${colors.reset} ${name}`));
}

async function handleStatus(manager: DatabaseMigrationManager) {
  console.log(`${colors.cyan}Migration Status:${colors.reset}\n`);

  const migrations = await manager.getAllMigrations();
  const applied = migrations.filter((m) => m.isApplied);
  const pending = migrations.filter((m) => !m.isApplied);

  console.log(`${colors.bright}Summary:${colors.reset}`);
  console.log(`  Total: ${migrations.length}`);
  console.log(`  ${colors.green}Applied: ${applied.length}${colors.reset}`);
  console.log(`  ${colors.yellow}Pending: ${pending.length}${colors.reset}\n`);

  if (migrations.length > 0) {
    console.log(`${colors.bright}Migrations:${colors.reset}`);
    migrations.forEach((m) => {
      const status = m.isApplied
        ? `${colors.green}✓ applied${colors.reset}`
        : `${colors.yellow}○ pending${colors.reset}`;
      console.log(`  ${status}  ${m.id}`);
    });
  }

  const procedures = await manager.getAllProcedures();
  console.log(`\n${colors.bright}Procedures:${colors.reset} ${procedures.length} file(s)`);
}

async function handleReset(manager: DatabaseMigrationManager, options: any) {
  console.log(`${colors.cyan}Resetting database (rolling back all migrations)...${colors.reset}\n`);

  if (options.dryRun) {
    const migrations = await manager.getAllMigrations();
    const applied = migrations.filter((m) => m.isApplied).reverse();
    if (applied.length === 0) {
      console.log(`${colors.gray}No migrations to rollback${colors.reset}`);
    } else {
      console.log(`${colors.yellow}Would rollback ${applied.length} migration(s):${colors.reset}`);
      applied.forEach((m) => console.log(`  - ${m.id}`));
    }
    return;
  }

  const rolledBack = await manager.resetAllMigrations();

  if (rolledBack.length === 0) {
    console.log(`${colors.gray}No migrations to rollback${colors.reset}`);
  } else {
    console.log(`${colors.green}✓${colors.reset} Rolled back ${rolledBack.length} migration(s):`);
    rolledBack.forEach((id) => console.log(`  ${colors.green}✓${colors.reset} ${id}`));
  }
}

async function handleFresh(manager: DatabaseMigrationManager, options: any) {
  console.log(`${colors.cyan}Fresh database setup (reset + migrate + procedures)...${colors.reset}\n`);

  if (options.dryRun) {
    console.log(`${colors.yellow}DRY RUN: Would perform:${colors.reset}`);
    console.log(`  1. Reset all migrations`);
    console.log(`  2. Run all migrations`);
    console.log(`  3. Run all procedures`);
    return;
  }

  // Reset
  console.log(`${colors.bright}Step 1/3: Resetting...${colors.reset}`);
  const rolledBack = await manager.resetAllMigrations();
  console.log(`${colors.green}✓${colors.reset} Rolled back ${rolledBack.length} migration(s)\n`);

  // Migrate
  console.log(`${colors.bright}Step 2/3: Migrating...${colors.reset}`);
  const migrated = await manager.runAllMigrations();
  console.log(`${colors.green}✓${colors.reset} Executed ${migrated.length} migration(s)\n`);

  // Procedures
  console.log(`${colors.bright}Step 3/3: Running procedures...${colors.reset}`);
  const procedures = await manager.runAllProcedures();
  console.log(`${colors.green}✓${colors.reset} Executed ${procedures.length} procedure(s)`);
}

// Run the CLI
main().catch((error) => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
