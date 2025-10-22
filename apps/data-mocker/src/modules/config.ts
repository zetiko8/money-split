export const ENVIRONMENT = {
  sendMail: () => process.env.NODE_ENV === 'production',
  secret: () => process.env.JWT_SECRET || 'myprivatekey',
};
