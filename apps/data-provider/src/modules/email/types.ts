export interface SendMailFn {
    (mailOptions: {
        to: string;
        subject: string;
        text: string;
    }): Promise<unknown>
}