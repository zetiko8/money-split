import fs from 'fs';
import path from 'path';
import { SendMailFn } from './types';

export const sendMail: SendMailFn = async (mailOptions) => {
  fs.writeFileSync(
    path.join(__dirname, `${mailOptions.to.replace('@', '')}.txt`),
    mailOptions.text,
    { encoding: 'utf-8' },
  );

  return true;
};