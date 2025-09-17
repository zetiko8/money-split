import { sanitizeForHtmlAttribute } from '@angular-monorepo/utils';
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
    INVITATION_FORM.setName(name);
    INVITATION_FORM.submit();
  },
  setName (
    name: string,
  ) {
    cy.get('input[name="name"').type(name);
  },
  expectNameMaxLengthError () {
    cy.get('input[name="name"')
      .parent()
      .find('[data-cy="max-length-error"]')
      .should('be.visible');
  },
  submit () {
    cy.get('[data-test="accept-invitation-btn"]').click();
  },
  expectSubmitButtonToBeDisabled () {
    cy.get('button[data-test="accept-invitation-btn"]')
      .should('be.disabled');
  },
};

export const REGISTER_FORM = {
  register (
    username: string,
    password: string,
  ) {
    REGISTER_FORM.setUsername(username);
    REGISTER_FORM.setPassword(password);
    REGISTER_FORM.submit();
  },
  setUsername (
    username: string,
  ) {
    cy.get('[data-testid="username-input"]')
      .type(username);
  },
  expectUsernameError () {
    cy.get('[data-testid="username-input"]')
      .parent()
      .find('[data-cy="error"]')
      .should('be.visible');
  },
  expectUsernameMaxLengthError () {
    cy.get('[data-testid="username-input"]')
      .parent()
      .find('[data-cy="max-length-error"]')
      .should('be.visible');
  },
  setPassword (
    password: string,
  ) {
    cy.get('[data-testid="password-input"]')
      .type(password);
  },
  submit () {
    cy.get('[data-testid="register-button"]')
      .click();
  },
};

export const CREATE_NAMESPACE_FORM = {
  visit (
    ownerKey: string,
  ) {
    cy.visit(`/${ownerKey}/new`);
  },
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
  expectSubmitButtonToBeDisabled () {
    cy.get('button[type=submit]')
      .should('be.disabled');
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
  expectNameError (errorMessage: string) {
    cy.get('input[name="namespaceName"]')
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
  goBack () {
    cy.get('[data-test="navigate-back-button"]')
      .click();
  },
  ...CREATE_NAMESPACE_FORM,
  visit (
    ownerKey: string,
    namespaceId: number,
  ) {
    cy.visit(`/${ownerKey}/namespace/${namespaceId}/settings`);
  },
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
  RECORD_BY_COST: (cost: string) => {
    const $el = () => cy
      .get('[data-test="namespace-record"]')
      .find('[data-test="record-cost"]')
      .contains(cost);
    return {
      exists () {
        $el().should('exist');
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
  isVisible () {
    cy.get('[data-test="payment-event-simple"]')
      .should('be.visible');
  },
  setCurrency: _RECORD_FORM.setCurrency,
  currencyIsSetTo: _RECORD_FORM.currencyIsSetTo,
  setCost: _RECORD_FORM.setCost,
  costIsSetTo: _RECORD_FORM.costIsSetTo,
  clickBenefitor: _RECORD_FORM.clickBenefitor,
  switchToComplexMode () {
    cy.get('[data-test="complex-mode-switcher"]')
      .click();
  },
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
    shouldHaveErrorOutline () {
      cy.get('[data-testid="currency-input"]')
        .should('have.class', 'error');
    },
    shouldNotHaveErrorOutline () {
      cy.get('[data-testid="currency-input"]')
        .should('not.have.class', 'error');
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
    shouldHaveErrorOutline () {
      cy.get('[data-testid="cost-input"]')
        .should('have.class', 'error');
    },
    shouldNotHaveErrorOutline () {
      cy.get('[data-testid="cost-input"]')
        .should('not.have.class', 'error');
    },
  },
};

export const RECORD_FORM_COMPLEX = {
  isVisible () {
    cy.get('[data-test="payment-event-complex"]')
      .should('be.visible');
  },
  switchToSimpleMode () {
    cy.get('[data-test="complex-mode-switcher"]')
      .click();
  },
  SWITCH_TO_SIMPLE_MODE_MODAL: {
    isVisible () {
      cy.get('[data-test="complex-mode-change-modal-warning"]')
        .should('be.visible');
    },
    cancel () {
      cy.get('[data-test="complex-mode-change-modal-warning-cancel-btn"]')
        .click();
    },
    confirm () {
      cy.get('[data-test="complex-mode-change-modal-warning-confirm-btn"]')
        .click();
    },
  },
  NOT_MATCHING_COST_MODE_MODAL: {
    isVisible () {
      cy.get('[data-test="not-matching-cost-modal-warning"]')
        .should('be.visible');
    },
    close () {
      cy.get('[data-test="not-matching-cost-modal-warning-close-btn"]')
        .click();
    },
    toSay (text: string) {
      cy.get('[data-test="not-matching-cost-modal-warning"]')
        .should('contain.text', text);
    },
  },
  PAID_BY (username: string) {
    const $el =
      () => cy
        .get('[data-test="payment-user-form-paid-by-' + sanitizeForHtmlAttribute(username) + '"]');
    return {
      OPEN_AMOUNT_FORM () {
        $el()
          .find('[data-test="add-amount-btn"]')
          .click();

        return RECORD_FORM_COMPLEX.PAID_BY(username)
          .AMOUNT_FORM(0);
      },
      AMOUNT_FORM: (index: number) => {
        const $elAmountForm =
          () => $el()
            .find('[data-test="amount-form"]')
            .eq(index);
        return {
          shouldHaveCost (cost: string) {
            $elAmountForm()
              .find('input[name="amount"]')
              .should('have.value', cost);
          },
          shouldHaveCurrency (currency: string) {
            $elAmountForm()
              .find('input[name="currency"]')
              .should('have.value', currency);
          },
          setCost (cost: string) {
            $elAmountForm()
              .find('input[name="amount"]')
              .clear();
            $elAmountForm()
              .find('input[name="amount"]')
              .type(cost);

            return RECORD_FORM_COMPLEX.PAID_BY(username)
              .AMOUNT_FORM(index);
          },
          setCurrency (currency: string) {
            if (currency === '') {
              $elAmountForm()
                .find('input[name="currency"]')
                .clear();
            } else {
              $elAmountForm()
                .find('input[name="currency"]')
                .clear();
              $elAmountForm()
                .find('input[name="currency"]')
                .type(currency);
            }

            return RECORD_FORM_COMPLEX.PAID_BY(username)
              .AMOUNT_FORM(index);
          },
          COST: () => {
            return {
              shouldHaveErrorOutline () {
                $elAmountForm()
                  .find('[data-testid="amount-input"]')
                  .should('have.class', 'error');
              },
              shouldNotHaveErrorOutline () {
                $elAmountForm()
                  .find('[data-testid="amount-input"]')
                  .should('not.have.class', 'error');
              },
            };
          },
          CURRENCY: () => {
            return {
              shouldHaveErrorOutline () {
                $elAmountForm()
                  .find('[data-testid="currency-input"]')
                  .should('have.class', 'error');
              },
              shouldNotHaveErrorOutline () {
                $elAmountForm()
                  .find('[data-testid="currency-input"]')
                  .should('not.have.class', 'error');
              },
            };
          },
        };
      },
    };
  },
  BENEFITORS (username: string) {
    const $el =
      () => cy
        .get('[data-test="payment-user-form-benefitors-' + sanitizeForHtmlAttribute(username) + '"]');
    return {
      OPEN_AMOUNT_FORM () {
        $el()
          .find('[data-test="add-amount-btn"]')
          .click();

        return RECORD_FORM_COMPLEX.BENEFITORS(username)
          .AMOUNT_FORM(0);
      },
      AMOUNT_FORM: (index: number) => {
        const $elAmountForm =
          () => $el()
            .find('[data-test="amount-form"]')
            .eq(index);
        return {
          shouldHaveCost (cost: string) {
            $elAmountForm()
              .find('input[name="amount"]')
              .should('have.value', cost);
          },
          shouldHaveCurrency (currency: string) {
            $elAmountForm()
              .find('input[name="currency"]')
              .should('have.value', currency);
          },
          setCost (cost: string) {
            $elAmountForm()
              .find('input[name="amount"]')
              .clear();
            $elAmountForm()
              .find('input[name="amount"]')
              .type(cost);

            return RECORD_FORM_COMPLEX.BENEFITORS(username)
              .AMOUNT_FORM(index);
          },
          setCurrency (currency: string) {
            if (currency === '') {
              $elAmountForm()
                .find('input[name="currency"]')
                .clear();
            } else {
              $elAmountForm()
                .find('input[name="currency"]')
                .clear();
              $elAmountForm()
                .find('input[name="currency"]')
                .type(currency);
            }

            return RECORD_FORM_COMPLEX.BENEFITORS(username)
              .AMOUNT_FORM(index);
          },
          COST: () => {
            return {
              shouldHaveErrorOutline () {
                $elAmountForm()
                  .find('[data-testid="amount-input"]')
                  .should('have.class', 'error');
              },
              shouldNotHaveErrorOutline () {
                $elAmountForm()
                  .find('[data-testid="amount-input"]')
                  .should('not.have.class', 'error');
              },
            };
          },
          CURRENCY: () => {
            return {
              shouldHaveErrorOutline () {
                $elAmountForm()
                  .find('[data-testid="currency-input"]')
                  .should('have.class', 'error');
              },
              shouldNotHaveErrorOutline () {
                $elAmountForm()
                  .find('[data-testid="currency-input"]')
                  .should('not.have.class', 'error');
              },
            };
          },
        };
      },
    };
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
  if (moment(date).month() === 8)
    return 'Sep';
  if (moment(date).month() === 9)
    return 'Oct';
  if (moment(date).month() === 10)
    return 'Nov';
  if (moment(date).month() === 11)
    return 'Dec';
  throw Error('Not implemented jet');
}