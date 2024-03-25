## upload to nginx
FROM node:16.14.2-slim

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
# copy bundle
USER node
COPY --chown=node:node /package*.json ./
RUN npm ci
COPY --chown=node:node /dist .

EXPOSE 3334

CMD [ "node", "main.js" ]