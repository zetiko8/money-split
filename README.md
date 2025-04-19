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