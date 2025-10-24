// Load environment variables first
import './env-loader';

import express from 'express';
import * as path from 'path';
import * as cors from 'cors';
import { mainRouter } from './router';
import { requestIdMiddleware } from './middleware/request-id.middleware';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();

app.use(requestIdMiddleware);
app.use(cors.default());
app.use(express.json({ limit: '50mb' }));
app.use('/data-provider/assets', express.static(path.join(__dirname, 'assets')));
app.use('/data-provider/app', mainRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use(errorMiddleware);

app.get('/data-provider/api', (req, res) => {
  res.send({ message: 'Welcome to data-provider!' });
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/data-provider`);
});
server.on('error', console.error);
