import moment = require('moment');


export const APP = {
  loaderISvisible () {
    cy.get('full-screen-loader')
      .should('be.visible');
  },
  expectErrorNotification (errorMessage: string) {
    cy
      .get('[data-cy="notification"]')
      .should('be.visible')
      .and('contain', errorMessage);
  },
  expectNoErrorNotification () {
    cy
      .get('[data-cy="notification"]')
      .should('not.exist');
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
    cy.get('input[name="namespaceName"]')
      .should('be.visible')
      .clear();
    cy.get('input[name="namespaceName"]')
      .type(name);
  },
  setAvatarColor (
    color: string,
  ) {
    cy.get('input[type=color]')
      .invoke('val', color)
      .trigger('input');
  },
  nameIs (
    name: string,
  ) {
    cy.get('input[name="namespaceName"]')
      .should('have.value', name);
  },
  submit () {
    cy.get('button[type=submit]')
      .click();
  },
  cancel () {
    cy.get('[data-test="cancel-button"]')
      .click();
  },
  uploadAvatar (imageName: string) {
    cy.get('input[type=file]').selectFile(`src/fixtures/${imageName}`);
  },
  expectFileUploadError (errorMessage: string) {
    cy.get('input[type=file]')
      .parent()
      .find('.error')
      .should('contain.text', errorMessage);
  },
  deleteUploadedImage () {
    cy.get('customize-avatar file-input .icon-btn')
      .click();
  },
  avatarIsHttpImage () {
    cy.get('customize-avatar avatar img')
      .should('be.visible')
      .and('have.attr', 'src')
      .should('be.a', 'string')
      .and('not.be.empty')
      .and('contain', '/assets/');
  },
  avatarIsUploadedImage () {
    cy.get('customize-avatar avatar img')
      .should('be.visible')
      .and('have.attr', 'src')
      .should('be.a', 'string')
      .and('not.be.empty')
      .and('contain', 'data:image');
  },
  avatarIsColoredAvatar () {
    cy.get('customize-avatar avatar .avatar-image')
      .should('be.visible');
  },
};

export const EDIT_NAMESPACE_FORM = {
  visit (
    ownerKey: string,
    namespaceId: number,
  ) {
    cy.visit(`/${ownerKey}/namespace/${namespaceId}/settings`);
  },
  goBack () {
    cy.get('[data-test="navigate-back-button"]')
      .click();
  },
  ...CREATE_NAMESPACE_FORM,
};

const NAMESPACE_USER = (username: string) => ({
  click () {
    cy.get(`[data-test-username="user-${username}"]`)
      .click();
  },
});

export const MEMBERS_TAB = {
  NAMESPACE_USER: {
    byUsername (username: string) {
      return NAMESPACE_USER(username);
    },
  },
};

export const VIEW_USER_VIEW = {
  userIsOnPage (
    username: string,
  ) {
    cy.get('[data-test="view-user-view"]')
      .should('be.visible')
      .find('[data-test="view-user-username"]')
      .should('contain.text', username);
  },
  goBack () {
    cy.get('[data-test="navigate-back-button"]')
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
  goToEditNamespace () {
    cy.get('[data-test="edit-namespace-button"]').click();
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
  userIsOnTab (
    tab: 'users' | 'records',
  ) {
    if (tab === 'users') {
      cy.get('[data-test="tab-users"]')
        .should('have.class', 'active');
    }
    if (tab === 'records') {
      cy.get('[data-test="tab-recordsList"]')
        .should('have.class', 'active');
    }
  },
  MEMBERS_TAB,
};

export const REALM_SCREEN = {
  visit (
    ownerKey: string,
  ) {
    cy.visit(`/${ownerKey}/realm`);
    cy.get('h4').contains('Moje skupine')
      .should('be.visible');
  },
  goToCreateANamespace () {
    cy.get('[data-test="new-namespace-button"]')
      .click();
    cy.get('h4').contains('Nova skupina')
      .should('be.visible');
  },
  expect,
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

const _RECORD_FORM = {
  setCurrency (
    currency: string,
  ) {
    if (currency === '') {
      cy.get('[data-testid="currency-input" ]')
        .clear();
    } else {
      cy.get('[data-testid="currency-input" ]')
        .clear();
      cy.get('[data-testid="currency-input" ]')
        .type(currency);
    }
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
    if (cost === '') {
      cy.get('[data-testid="cost-input"]')
        .clear();
    } else {
      cy.get('[data-testid="cost-input"]')
        .clear();
      cy.get('[data-testid="cost-input"]')
        .type(cost);
    }
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

export const RECORD_FORM = {
  setCurrency: _RECORD_FORM.setCurrency,
  currencyIsSetTo: _RECORD_FORM.currencyIsSetTo,
  setCost: _RECORD_FORM.setCost,
  costIsSetTo: _RECORD_FORM.costIsSetTo,
  clickBenefitor: _RECORD_FORM.clickBenefitor,
  BENEFITORS: {
    ..._RECORD_FORM.BENEFITORS,
    click: _RECORD_FORM.clickBenefitor,
    shouldHaveError (message: string) {
      cy.get('[data-testid="add-benefitor"]')
        .find('.error')
        .should('contain.text', message);
    },
    shouldNotHaveError () {
      cy.get('[data-testid="add-benefitor"]')
        .find('.error')
        .should('not.exist');
    },
  },
  clickPaidBy: _RECORD_FORM.clickPaidBy,
  PAID_BY: {
    ..._RECORD_FORM.PAID_BY,
    click: _RECORD_FORM.clickPaidBy,
    shouldHaveError (message: string) {
      cy.get('[data-testid="add-paid-by"]')
        .find('.error')
        .should('contain.text', message);
    },
    shouldNotHaveError () {
      cy.get('[data-testid="add-paid-by"]')
        .find('.error')
        .should('not.exist');
    },
  },
  confirm: _RECORD_FORM.confirm,
  CONFIRM_BUTTON: {
    shouldBeDisabled () {
      cy.get('[data-test="add-expense-confirm-btn"]')
        .should('be.disabled');
    },
    shouldBeEnabled () {
      cy.get('[data-test="add-expense-confirm-btn"]')
        .should('be.enabled');
    },
  },
  CURRENCY: {
    set: _RECORD_FORM.setCurrency,
    shouldHaveError (message: string) {
      cy.get('[data-testid="currency-input"]')
        .parent()
        .find('.error')
        .should('contain.text', message);
    },
    shouldNotHaveError () {
      cy.get('[data-testid="currency-input"]')
        .parent()
        .find('.error')
        .should('not.exist');
    },
  },
  COST: {
    set: _RECORD_FORM.setCost,
    shouldHaveError (message: string) {
      cy.get('[data-testid="cost-input"]')
        .parent()
        .find('.error')
        .should('contain.text', message);
    },
    shouldNotHaveError () {
      cy.get('[data-testid="cost-input"]')
        .parent()
        .find('.error')
        .should('not.exist');
    },
  },
};

function getMonthString (date: Date) {
  if (moment(date).month() === 0)
    return 'Jan';
  if (moment(date).month() === 1)
    return 'Feb';
  if (moment(date).month() === 2)
    return 'Mar';
  if (moment(date).month() === 3)
    return 'Apr';
  if (moment(date).month() === 4)
    return 'Maj';
  if (moment(date).month() === 5)
    return 'Jun';
  if (moment(date).month() === 6)
    return 'Jul';
  if (moment(date).month() === 7)
    return 'Avg';
  throw Error('Not implemented jet');
}