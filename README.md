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
