import express from 'express';
import * as path from 'path';
import * as cors from 'cors';
import { mainRouter } from './bl/router';
import { cyBackdoorRouter } from './modules/cybackdoor/cybackdoor.router';
import { ERROR_CODE } from '@angular-monorepo/entities';

const app = express();

app.use(cors.default());
app.use(express.json({ limit: '50mb' }));
app.use('/data-provider/assets', express.static(path.join(__dirname, 'assets')));
app.use('/data-provider/cybackdoor', cyBackdoorRouter);
app.use('/data-provider/app', mainRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.message);
  if (Object.values(ERROR_CODE).includes(err.message)) {
    res.status(400);
  } else {
    res.status(500);
  }

  return res.json({
    error: err.message
  });
});

app.get('/data-provider/api', (req, res) => {
  res.send({ message: 'Welcome to data-provider!' });
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/data-provider`);
});
server.on('error', console.error);
