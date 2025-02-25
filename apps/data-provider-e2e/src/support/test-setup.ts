/* eslint-disable */

import https from 'https';
import axios from 'axios';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
})
axios.defaults.httpsAgent = httpsAgent;