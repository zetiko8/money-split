export const ENV = () => {
  const ce = Cypress.env();

  const BACKDOOR_USERNAME = ce[ce['env']].ADMIN_USERNAME as string;
  const BACKDOOR_PASSWORD = ce[ce['env']].ADMIN_PASSWORD as string;
  const DATA_PROVIDER_URL = ce[ce['env']].MIDDLEWARE_URL as string;

  return {
    BACKDOOR_USERNAME,
    BACKDOOR_PASSWORD,
    DATA_PROVIDER_URL,
  };
};