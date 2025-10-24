// Load environment variables first
import './env-loader';

import express from 'express';
import * as path from 'path';
import * as cors from 'cors';
import { cyBackdoorRouter } from './modules/cybackdoor/cybackdoor.router';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { AppError } from '@angular-monorepo/express-lib';
import { mainRouter } from './router';

const app = express();

app.use(cors.default());
app.use(express.json({ limit: '50mb' }));
app.use('/data-mocker/assets', express.static(path.join(__dirname, 'assets')));
app.use('/data-mocker/cybackdoor', cyBackdoorRouter);
app.use('/data-mocker/app', mainRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.message);
  if (err.originalError) {
    const appError = err as AppError;
    console.error(appError.originalError.message);
    appError.appStack.forEach(stack => {
      console.error(' - ' + stack);
    });
  }
  if (err.context) {
    console.error(err.context);
  }

  if (!err.originalError && !err.context) {
    console.error(`FROM: ${req.method} ${req.url}`);
    console.error(err.stack);
  }
  if (Object.values(ERROR_CODE).includes(err.message)) {
    res.status(400);
  } else {
    res.status(500);
  }

  return res.json({
    error: err.message,
  });
});

app.get('/data-mocker/api', (req, res) => {
  res.send({ message: 'Welcome to data-mocker!' });
});

const port = process.env.DATA_MOCKER_PORT || 3334;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/data-mocker`);
});
server.on('error', console.error);
