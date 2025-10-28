## Build Frontend

```terminal
npm ci
nx run money-split:build:production
cd devops
cd money-split-frontend
docker build --tag money-split-frontend .
```

### Certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout nginx-selfsigned.key -out nginx-selfsigned.crt
- Common Name (e.g. server FQDN or YOUR name) []:{my-ip}

## Build Backend

```terminal
npm ci
npx nx run data-provider:build --configuration=production
cd devops
cd data-provider
docker build --tag money-split-data-provider .
```

## Docker local

```
npm run docker-compose:local
```

### Links
 - https://localhost:8311/money-split/register
 - https://localhost:8311/admin-dashboard/

### Update DB

If a admin user does not exist add an admin user.
On Admin Dashboard run all the migrations
On Admin Dashboard run all the procedures
On Admin Dashboard add the test user.

### Test

```
npm run test:production-local:headless
```

## Development

Requirements:
- Node.js
- Docker

### Quick Start (Automated Setup)

Run everything with one command:

```terminal
npm run setup
npm run start:dev-servers
```

This will:
1. Generate `.env` file with random credentials and ports
2. Start Docker database container
3. Run database migrations and procedures
4. Generate frontend config from environment variables
5. Start all development servers (data-provider, data-mocker, money-split frontend)

The frontend will be available at the URL shown in the console (typically `http://localhost:4200`).

### Manual Setup

If you prefer to set up step by step:

1. **Generate environment variables**

```terminal
npm run generate-env
```

This creates a `.env` file with random credentials and ports.

2. **Start database and run migrations**

```terminal
npm run docker:start
npm run db:migrate
npm run db:procedures
npm run create-test-admin
```

3. **Generate frontend config**

```terminal
npm run generate-frontend-config
```

This creates `apps/money-split/src/assets/config/config.json` from `.env` variables.

4. **Start individual servers**

```terminal
# Backend servers
npm run start:data-provider
npm run start:data-mocker

# Frontend
npm run start:money-split
```

Or start all at once:

```terminal
npm run start:dev-servers
```

### Admin Dashboard (Optional)

To use the admin dashboard for manual database management:

```terminal
npm run dev:migration-manager
npm run dev:admin-dashboard
```

Open http://localhost:4201/admin-dashboard/db-management in browser.

### Environment Variables

All configuration is stored in the `.env` file:
- `MIDDLEWARE_URL` - Backend API URL
- `DATA_MOCKER_URL` - Data mocker API URL
- `FRONTEND_URL` - Frontend application URL
- `FRONTEND_PORT` - Frontend port
- Database credentials and ports
- JWT secrets and admin credentials

See `.env.example` for all available variables.

