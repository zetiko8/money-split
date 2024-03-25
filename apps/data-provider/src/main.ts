import express from 'express';
import * as path from 'path';
import * as cors from 'cors';
import { mainRouter } from './bl/router';
import { cyBackdoorRouter } from './modules/cybackdoor/cybackdoor.router';
import { ERROR_CODE } from '@angular-monorepo/entities';

const app = express();

app.use(cors.default());
app.use(express.json({ limit: '50mb' }));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/cybackdoor', cyBackdoorRouter);
app.use('/app', mainRouter);

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

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to data-provider!' });
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);
