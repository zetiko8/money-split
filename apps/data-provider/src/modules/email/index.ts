import { ENVIRONMENT } from '../config';
import { SendMailFn } from './types';
import { sendMail as implSendMail } from './email';
import { sendMail as mockSendMail } from './mock-email';

export const sendMail: SendMailFn
    = ENVIRONMENT.sendMail ? implSendMail : mockSendMail;