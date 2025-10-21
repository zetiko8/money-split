# Database Migration CLI

A TypeScript CLI tool for managing database migrations and stored procedures.

## 🚀 Quick Start

```bash
# 1. Generate environment configuration
npm run generate-env

# 2. Start database
cd tools
docker-compose up -d

# 3. Run migrations
npm run db:migrate

# 4. Run procedures
npm run db:procedures

# 5. Check status
npm run db:status
```

## 📋 Available Commands

### Migration Commands

#### `npm run db:migrate`
Run all pending migrations (recommended for normal development).

```bash
npm run db:migrate
```

#### `npm run db:migrate:all`
Run all migrations, including already applied ones (force).

```bash
npm run db:migrate:all
```

#### `npm run db:migrate:down`
Rollback the last applied migration.

```bash
npm run db:migrate:down
```

### Procedure Commands

#### `npm run db:procedures`
Run all stored procedures from the procedures directory.

```bash
npm run db:procedures
```

### Status Commands

#### `npm run db:status`
Show the current status of all migrations (applied vs pending).

```bash
npm run db:status
```

### Reset Commands

#### `npm run db:reset`
Rollback all migrations (clean slate).

```bash
npm run db:reset
```

#### `npm run db:fresh`
Complete fresh setup: reset all migrations, run all migrations, then run all procedures.

```bash
npm run db:fresh
```

## 🎯 Common Workflows

### First Time Setup

```bash
# 1. Generate .env file with random credentials
npm run generate-env

# 2. Start MySQL database
cd tools
docker-compose up -d
cd ..

# 3. Fresh database setup (migrations + procedures)
npm run db:fresh
```

### Daily Development

```bash
# Check what needs to be run
npm run db:status

# Run pending migrations
npm run db:migrate

# Run procedures if updated
npm run db:procedures
```

### After Pulling New Code

```bash
# Check for new migrations
npm run db:status

# Run any pending migrations
npm run db:migrate
```

### Rollback Changes

```bash
# Rollback last migration
npm run db:migrate:down

# Or reset everything
npm run db:reset
```

### Testing Fresh Setup

```bash
# Complete reset and fresh setup
npm run db:fresh
```

## 🔧 Advanced Usage

### Dry Run Mode

Preview what would be executed without making changes:

```bash
npm run db:migrate -- --dry-run
npm run db:procedures -- --dry-run
npm run db:fresh -- --dry-run
```

### Verbose Mode

Show detailed output including SQL statements:

```bash
npm run db:migrate -- --verbose
```

### Combine Options

```bash
npm run db:migrate -- --dry-run --verbose
```

## 📁 File Structure

```
tools/
├── db-migrate.ts          # Main CLI tool
├── db-migrate-lib.ts      # Shared migration logic
├── generate-env.js        # Environment generator
├── docker-compose.yml     # Database container
└── tsconfig.json          # TypeScript config

apps/migration-manager/src/assets/
├── migrations/            # Migration SQL files
│   ├── 1-setup-up.sql
│   ├── 1-setup-down.sql
│   └── ...
└── procedures/            # Stored procedure SQL files
    ├── addPaymentEvent.sql
    └── ...
```

## 🗂️ Migration Files

Migrations follow the naming pattern: `{number}-{name}-{direction}.sql`

- **Number**: Sequential number (1, 2, 3, etc.)
- **Name**: Descriptive name (setup, owner, user, etc.)
- **Direction**: `up` or `down`

Examples:
- `1-setup-up.sql` - Creates Migration table
- `2-owner-up.sql` - Creates Owner table
- `2-owner-down.sql` - Drops Owner table

## 🔄 Migration Tracking

The CLI tracks applied migrations in the `Migration` table:

```sql
CREATE TABLE `Migration` (
  `id` VARCHAR(255) PRIMARY KEY
);
```

Each applied migration's ID is stored in this table.

## 🌍 Environment Configuration

The CLI loads configuration from the root `.env` file:

```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=main
MYSQL_PORT=13308
```

## 🐛 Troubleshooting

### Connection Refused

```bash
# Make sure database is running
cd tools
docker-compose ps

# Start if not running
docker-compose up -d
```

### Migration Already Applied

```bash
# Check status
npm run db:status

# If you need to rerun, reset first
npm run db:reset
npm run db:migrate
```

### Procedure Errors

```bash
# Run with verbose mode to see SQL
npm run db:procedures -- --verbose
```

### TypeScript Errors

```bash
# Make sure ts-node is installed
npm install

# Check TypeScript config
cat tools/tsconfig.json
```

## 🔗 Integration with Migration Manager App

The CLI tool and the migration-manager Express app both use the same migration files:

- **CLI Tool**: Direct database access, faster, CI/CD friendly
- **Migration Manager App**: Web UI, manual control, visual feedback

Both can coexist. Use the CLI for automated workflows and the app for manual management.

## 📝 Creating New Migrations

1. Create two files in `apps/migration-manager/src/assets/migrations/`:
   - `{next-number}-{name}-up.sql` - Forward migration
   - `{next-number}-{name}-down.sql` - Rollback migration

2. Run the migration:
   ```bash
   npm run db:migrate
   ```

3. Verify:
   ```bash
   npm run db:status
   ```

## 🎨 Output Colors

The CLI uses colored output for better readability:

- 🟢 **Green**: Success, applied migrations
- 🟡 **Yellow**: Warnings, pending migrations
- 🔴 **Red**: Errors
- 🔵 **Blue**: Headers, sections
- ⚪ **Gray**: Info, details

## 🤝 Contributing

When adding new migrations:

1. Follow the naming convention
2. Always create both `up` and `down` files
3. Test with `--dry-run` first
4. Document complex migrations

## 📚 Additional Resources

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Node.js mysql2 Package](https://github.com/sidorares/node-mysql2)
