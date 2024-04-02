import moment = require('moment');


export const APP = {
  loaderISvisible () {
    cy.get('full-screen-loader')
      .should('be.visible');
  },
};

export const LOGIN_FORM = {
  login (
    username: string,
    password: string,
  ) {
    cy.get('input[name="username"]').type(username);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
  },
  registerInstead () {
    cy.get('[data-test="register-link"]')
      .click();
  },
};

export const INVITATION_FORM = {
  accept (
    name: string,
  ) {
    cy.get('input[name="name"').type(name);
    cy.get('[data-test="accept-invitation-btn"]').click();
  },
};

export const REGISTER_FORM = {
  register (
    username: string,
    password: string,
  ) {
    cy.get('[data-testid="username-input"]') // enter a username
      .type(username);
    cy.get('[data-testid="password-input"]') // enter a password
      .type(password);
    cy.get('[data-testid="register-button"]') // click the register button
      .click();
  },
};

export const CREATE_NAMESPACE_FORM = {
  setName (
    name: string,
  ) {
    cy.get('input[name="namespaceName"]') // enter a username
      .type(name);
  },
  submit () {
    cy.get('button[type=submit]')
      .click();
  },
};

export const NAMESPACE_SCREEN = {
  visit (
    ownerKey: string,
    namespaceId: number,
  ) {
    cy.visit(`/${ownerKey}/namespace/${namespaceId}`);
  },
  goToAddRecord () {
    cy.get('[data-test="add-expense-button"]').click();
  },
  openMembersTab () {
    cy.get('[role=tab][data-test=tab-users]')
      .click();
  },
  openRecordsListTab () {
    cy.get('[role=tab][data-test=tab-recordsList]')
      .click();
  },
  userIsOn (
    namespaceName: string,
  ) {
    cy.get('[data-test="namespace-view-page-header"]')
      .should('contain.text', namespaceName);
    cy.get('[role=tab][data-test=tab-users]')
      .should('be.visible');
  },
};

export const REALM_SCREEN = {
  visit (
    ownerKey: string,
  ) {
    cy.visit(`/${ownerKey}/realm`);
  },
  goToCreateANamespace () {
    cy.get('[data-test="new-namespace-button"]')
      .click();
  },
};

export const RECORD_LIST = {
  shouldHaveNumberOfRecords (num: number) {
    cy.get('[data-test="namespace-record"]')
      .should('have.length', num);
  },
  DATE: (index: number) => {
    const $el = () => cy
      .get('[data-test="records-day"]')
      .eq(index);

    return {
      RECORD: (index: number) => {
        return RECORD_LIST.RECORD(index, $el);
      },
      hasDate (date: Date) {
        if (moment(date).month() !== 2)
          throw Error('Not implemented jet');
        const string = `Mar ${moment(date).date()}, ${moment(date).year()}`;
        $el().find('[data-test="records-day-label"]')
          .contains(string);
      },
      shouldHaveNumberOfRecords (num: number) {
        $el().find('[data-test="namespace-record"]')
          .should('have.length', num);
      },
    };
  },
  RECORD: (
    index: number,
    inSection?: () =>  Cypress.Chainable<JQuery>,
  ) => {
    const $el =
            inSection ?
              () => inSection()
                .find('[data-test="namespace-record"]')
                .eq(index)
              : () => cy
                .get('[data-test="namespace-record"]')
                .eq(index);

    return {
      goToEdit () {
        $el().click();
      },
      shouldHaveNumberOfPayers (num: number) {
        $el().find('[data-test="payer-avatar"]')
          .should('have.length', num);
      },
      shouldHaveNumberOfBenefitors (num: number) {
        $el().find('[data-test="benefitor-avatar"]')
          .should('have.length', num);
      },
      PAYER: (index: number) => {
        const payer$ = () => $el()
          .find('[data-test="payer-avatar"]')
          .eq(index);

        return {
          hasId (id: string) {
            payer$()
              .should('have.attr', 'id')
              .should('equal', id);
          },
        };

      },
      BENEFITOR: (index: number) => {
        const payer$ = () => $el()
          .find('[data-test="benefitor-avatar"]')
          .eq(index);

        return {
          hasId (id: string) {
            payer$()
              .should('have.attr', 'id')
              .should('equal', id);
          },
        };

      },
      shouldHaveCost (cost: string) {
        $el().find('[data-test="record-cost"]')
          .should('contain.text', cost);
      },
      shouldHaveCurrency (value: string) {
        $el().find('[data-test="record-currency"]')
          .should('contain.text', value);
      },
      isSettledOn (date: Date) {
        const string
                    = `${getMonthString(date)} ${moment(date).date()}, ${moment(date).year()}`;
        $el().find('[data-test="settled-on-label"]')
          .contains(string);
      },
    };
  },
  SETTLEMENT: (
    index: number,
    inSection?: () =>  Cypress.Chainable<JQuery>,
  ) => {
    const $el =
            inSection ?
              () => inSection()
                .find('[data-test="settlement-record"]')
                .eq(index)
              : () => cy
                .get('[data-test="settlement-record"]')
                .eq(index);

    return {
      RECORD: (index: number) => {
        const $recordEl = () => $el()
          .find('[data-test="debt-item"]')
          .eq(index);

        return {
          goToEdit () {
            $recordEl().click();
          },
          IN_DEBT: () => {
            const indDebt$ = () => $recordEl()
              .find('[data-test="benefitor-avatar"]');

            return {
              hasId (id: string) {
                indDebt$()
                  .should('have.attr', 'id')
                  .should('equal', id);
              },
            };

          },
          DEBT_TO: () => {
            const debtTo$ = () => $recordEl()
              .find('[data-test="payer-avatar"]');

            return {
              hasId (id: string) {
                debtTo$()
                  .should('have.attr', 'id')
                  .should('equal', id);
              },
            };

          },
          shouldHaveDebtAmount (cost: string) {
            $recordEl().find('[data-test="record-cost"]')
              .should('contain.text', cost);
          },
          shouldHaveCurrency (value: string) {
            $recordEl().find('[data-test="record-currency"]')
              .should('contain.text', value);
          },
          isSettledOn (date: Date) {
            if (moment(date).month() !== 2)
              throw Error('Not implemented jet');
            const string
                            = `Mar ${moment(date).date()}, ${moment(date).year()}`;
            $recordEl().find('[data-test="settled-on-label"]')
              .contains(string);
          },
          toggleSettled () {
            $recordEl()
              .find(
                'checkbox-button',
              ).click();
          },
          isSettled () {
            $recordEl()
              .find(
                'checkbox-button',
              ).find('input').should('be.checked');
          },
          isNotSettled () {
            $recordEl()
              .find(
                'checkbox-button',
              ).find('input').should('not.be.checked');
          },
        };
      },
      goToEdit () {
        $el().click();
      },
      isSettledOn (date: Date) {
        const string
                    = `${getMonthString(date)} ${moment(date).date()}, ${moment(date).year()}`;
        $el().find('[data-test="settled-on-label"]')
          .contains(string);
      },
      shouldBeSettled () {
        $el()
          .should('have.class', 'is-all-settled');
      },
    };
  },
  settleButton: {
    isNotVisible () {
      cy.get('[data-test="settle-button"]')
        .should('not.be.visible');
    },
    click () {
      cy.get('[data-test="settle-button"]')
        .should('be.visible')
        .click();
    },
  },
};

export const SETTLE_PREVIEW_SCREEN = {
  shouldHaveNumberOfRecords (num: number) {
    cy.get('[data-test="namespace-record"]')
      .should('have.length', num);
  },
  RECORD: (
    index: number,
    inSection?: () =>  Cypress.Chainable<JQuery>,
  ) => {
    const $el =
            inSection ?
              () => inSection()
                .find('[data-test="namespace-record"]')
                .eq(index)
              : () => cy
                .get('[data-test="namespace-record"]')
                .eq(index);

    return {
      goToEdit () {
        $el().click();
      },
      shouldHaveNumberOfPayers (num: number) {
        $el().find('[data-test="payer-avatar"]')
          .should('have.length', num);
      },
      shouldHaveNumberOfBenefitors (num: number) {
        $el().find('[data-test="benefitor-avatar"]')
          .should('have.length', num);
      },
      PAYER: (index: number) => {
        const payer$ = () => $el()
          .find('[data-test="payer-avatar"]')
          .eq(index);

        return {
          hasId (id: string) {
            payer$()
              .should('have.attr', 'id')
              .should('equal', id);
          },
        };

      },
      BENEFITOR: (index: number) => {
        const payer$ = () => $el()
          .find('[data-test="benefitor-avatar"]')
          .eq(index);

        return {
          hasId (id: string) {
            payer$()
              .should('have.attr', 'id')
              .should('equal', id);
          },
        };

      },
      shouldHaveCost (cost: string) {
        $el().find('[data-test="record-cost"]')
          .should('contain.text', cost);
      },
      shouldHaveCurrency (value: string) {
        $el().find('[data-test="record-currency"]')
          .should('contain.text', value);
      },
    };
  },
  settleButton: {
    isNotVisible () {
      cy.get('[data-test="settle-preview-confirm-button"]')
        .should('not.be.visible');
    },
    click () {
      cy.get('[data-test="settle-preview-confirm-button"]')
        .should('be.visible')
        .click();
    },
  },
};

export const RECORD_FORM = {
  setCurrency (
    currency: string,
  ) {
    cy.get('[data-testid="currency-input" ]')
      .clear();
    cy.get('[data-testid="currency-input" ]')
      .type(currency);
  },
  currencyIsSetTo (
    currency: string,
  ) {
    cy.get('[data-testid="currency-input" ]')
      .should('have.value', currency);
  },
  setCost (
    cost: string,
  ) {
    cy.get('[data-testid="cost-input"]')
      .clear();
    cy.get('[data-testid="cost-input"]')
      .type(cost);
  },
  costIsSetTo (
    cost: string,
  ) {
    cy.get('[data-testid="cost-input"]')
      .should('have.value', cost);
  },
  clickBenefitor (
    username: string,
  ) {
    cy.get('[data-testid="add-benefitor"]')
      .contains(username)
      .click();
  },
  BENEFITORS: {
    areSelected (
      names: string[],
    ) {
      names.forEach(name => {
        cy.get('[data-testid="add-benefitor"]')
          .contains(name)
          .parent()
          .find('i')
          .should('have.class', 'fa-check');
      });
    },
    areNotSelected (
      names: string[],
    ) {
      names.forEach(name => {
        cy.get('[data-testid="add-benefitor"]')
          .contains(name)
          .parent()
          .find('i')
          .should('have.class', 'fa-square');
      });
    },
  },
  clickPaidBy (
    username: string,
  ) {
    cy.get('[data-testid="add-paid-by"]')
      .contains(username)
      .click();
  },
  PAID_BY: {
    areSelected (
      names: string[],
    ) {
      names.forEach(name => {
        cy.get('[data-testid="add-paid-by"]')
          .contains(name)
          .parent()
          .find('i')
          .should('have.class', 'fa-check');
      });
    },
    areNotSelected (
      names: string[],
    ) {
      names.forEach(name => {
        cy.get('[data-testid="add-paid-by"]')
          .contains(name)
          .parent()
          .find('i')
          .should('have.class', 'fa-square');
      });
    },
  },
  confirm () {
    cy.get('[data-test="add-expense-confirm-btn"]').click();
  },
};

function getMonthString (date: Date) {
  if (moment(date).month() === 2)
    return 'Mar';
  if (moment(date).month() === 3)
    return 'Apr';
  throw Error('Not implemented jet');
}