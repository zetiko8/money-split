import nodemailer from 'nodemailer';
import { SendMailFn } from './types';

const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "money.split.demo@gmail.com",
      pass: "lvik dwix yfxi utbs",
    },
});

export const sendMail: SendMailFn = (
    mailOptions: {
        to: string,
        subject: string,
        text: string,
    }
) => {
    return new Promise((resolve, reject) => {
        transporter.sendMail({
            from: 'money.split.demo@gmail.com',
            to: mailOptions.to,
            subject: mailOptions.subject,
            html: mailOptions.text,
        }, (error, info) => {
            if (error) {
              console.error("Error sending email: ", error);
              reject(error);
            } else {
              console.log("Email sent: ", info.response);
              resolve(info.response);
            }
          }); 
    });
}