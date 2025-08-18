import { NAMESPACE_SCREEN, RECORD_FORM, RECORD_FORM_COMPLEX, RECORD_LIST } from '../support/app.po';
import * as moment from 'moment';
import { BACKDOOR_ACTIONS, TestOwner, TestScenarioNamespace } from '@angular-monorepo/backdoor';
import { ACTIONS } from '../support/actions';
import { ENV } from '../support/config';

const DATA_PROVIDER_URL = ENV().DATA_PROVIDER_URL;

describe('Add expense complex', () => {

  describe('can switch to complex mode',() => {
    let namespaceId!: number;
    let creatorOwner!: TestOwner;
    let scenario!: TestScenarioNamespace;

    before(async () => {
      scenario = await BACKDOOR_ACTIONS.SCENARIO.prepareNamespace(
        DATA_PROVIDER_URL,
        ENV().BACKDOOR_USERNAME,
        ENV().BACKDOOR_PASSWORD,
        'testnamespace',
        {  username: 'testuser'},
        [
          {  username: 'atestuser1'},
          {  username: 'btestuser2'},
          {  username: 'ctestuser3'},
        ],
      );

      creatorOwner = scenario.creator.owner;
      namespaceId = scenario.namespaceId;
    });

    it('can switch to complex mode with an empty form', () => {
      ACTIONS.loginTestOwnerWithToken(creatorOwner.token);

      NAMESPACE_SCREEN.visit(creatorOwner.owner.key, namespaceId);
      NAMESPACE_SCREEN.goToAddRecord();
      RECORD_FORM.switchToComplexMode();
      RECORD_FORM_COMPLEX.isVisible();
    });

    it('can switch back to simple mode with an empty form, without warning', () => {
      ACTIONS.loginTestOwnerWithToken(creatorOwner.token);

      NAMESPACE_SCREEN.visit(creatorOwner.owner.key, namespaceId);
      NAMESPACE_SCREEN.goToAddRecord();
      RECORD_FORM.switchToComplexMode();
      RECORD_FORM_COMPLEX.isVisible();
      RECORD_FORM_COMPLEX.switchToSimpleMode();
      RECORD_FORM.isVisible();
    });

    it('can switch to complex mode with a filled form', () => {
      ACTIONS.loginTestOwnerWithToken(creatorOwner.token);

      NAMESPACE_SCREEN.visit(creatorOwner.owner.key, namespaceId);
      NAMESPACE_SCREEN.goToAddRecord();
      RECORD_FORM.setCurrency('SIT');
      RECORD_FORM.setCost('5.4');
      RECORD_FORM.clickBenefitor('atestuser1');
      RECORD_FORM.clickBenefitor('btestuser2');
      RECORD_FORM.clickBenefitor('ctestuser3');
      RECORD_FORM.clickPaidBy('testuser');
      RECORD_FORM.switchToComplexMode();
      RECORD_FORM_COMPLEX.isVisible();
      RECORD_FORM_COMPLEX.PAID_BY('testuser')
        .AMOUNT_FORM(0)
        .shouldHaveCost('5.4');
      RECORD_FORM_COMPLEX.BENEFITORS('atestuser1')
        .AMOUNT_FORM(0)
        .shouldHaveCost('1.8');
      RECORD_FORM_COMPLEX.BENEFITORS('btestuser2')
        .AMOUNT_FORM(0)
        .shouldHaveCost('1.8');
      RECORD_FORM_COMPLEX.BENEFITORS('ctestuser3')
        .AMOUNT_FORM(0)
        .shouldHaveCost('1.8');
    });

    it('can switch back to simple mode with a filled form, without warning, if all costs are the same', () => {
      ACTIONS.loginTestOwnerWithToken(creatorOwner.token);

      NAMESPACE_SCREEN.visit(creatorOwner.owner.key, namespaceId);
      NAMESPACE_SCREEN.goToAddRecord();
      RECORD_FORM.setCurrency('SIT');
      RECORD_FORM.setCost('5.4');
      RECORD_FORM.clickBenefitor('atestuser1');
      RECORD_FORM.clickBenefitor('btestuser2');
      RECORD_FORM.clickBenefitor('ctestuser3');
      RECORD_FORM.clickPaidBy('testuser');
      RECORD_FORM.switchToComplexMode();
      RECORD_FORM_COMPLEX.isVisible();
      RECORD_FORM_COMPLEX.switchToSimpleMode();
      RECORD_FORM.isVisible();
    });

    it('can switch back to simple mode with a filled form, with a warning, if cost are complex', () => {
      ACTIONS.loginTestOwnerWithToken(creatorOwner.token);

      NAMESPACE_SCREEN.visit(creatorOwner.owner.key, namespaceId);
      NAMESPACE_SCREEN.goToAddRecord();
      RECORD_FORM.switchToComplexMode();
      RECORD_FORM_COMPLEX.isVisible();
      RECORD_FORM_COMPLEX.BENEFITORS('atestuser1')
        .OPEN_AMOUNT_FORM()
        .setCost('1.8')
        .setCurrency('SIT');
      RECORD_FORM_COMPLEX.switchToSimpleMode();
      RECORD_FORM_COMPLEX.SWITCH_TO_SIMPLE_MODE_MODAL.isVisible();
      RECORD_FORM_COMPLEX.SWITCH_TO_SIMPLE_MODE_MODAL.cancel();
      RECORD_FORM_COMPLEX.isVisible();
      RECORD_FORM_COMPLEX.switchToSimpleMode();
      RECORD_FORM_COMPLEX.SWITCH_TO_SIMPLE_MODE_MODAL.isVisible();
      RECORD_FORM_COMPLEX.SWITCH_TO_SIMPLE_MODE_MODAL.confirm();
      RECORD_FORM_COMPLEX.isVisible();
    });
  });

  describe('add an expense',() => {
    let namespaceId!: number;
    let creatorOwner!: TestOwner;
    let scenario!: TestScenarioNamespace;

    before(async () => {
      scenario = await BACKDOOR_ACTIONS.SCENARIO.prepareNamespace(
        DATA_PROVIDER_URL,
        ENV().BACKDOOR_USERNAME,
        ENV().BACKDOOR_PASSWORD,
        'testnamespace',
        {  username: 'testuser'},
        [
          {  username: 'atestuser1'},
          {  username: 'btestuser2'},
          {  username: 'ctestuser3'},
        ],
      );

      creatorOwner = scenario.creator.owner;
      namespaceId = scenario.namespaceId;
    });

    it('can add an expense with complex mode', () => {
      ACTIONS.loginTestOwnerWithToken(creatorOwner.token);

      NAMESPACE_SCREEN.visit(creatorOwner.owner.key, namespaceId);
      NAMESPACE_SCREEN.goToAddRecord();
      RECORD_FORM.switchToComplexMode();
      RECORD_FORM_COMPLEX.isVisible();
      RECORD_FORM_COMPLEX.PAID_BY('testuser')
        .OPEN_AMOUNT_FORM()
        .setCost('5.4')
        .setCurrency('SIT');
      RECORD_FORM_COMPLEX.BENEFITORS('atestuser1')
        .OPEN_AMOUNT_FORM()
        .setCost('1.8')
        .setCurrency('SIT');
      RECORD_FORM_COMPLEX.BENEFITORS('btestuser2')
        .OPEN_AMOUNT_FORM()
        .setCost('1.8')
        .setCurrency('SIT');
      RECORD_FORM_COMPLEX.BENEFITORS('ctestuser3')
        .OPEN_AMOUNT_FORM()
        .setCost('1.8')
        .setCurrency('SIT');

      RECORD_FORM_COMPLEX.confirm();
      RECORD_LIST.RECORD_BY_COST('5.4').exists();
    });
  });

  describe('form',() => {
    let namespaceId!: number;
    let creatorOwner!: TestOwner;

    before(async () => {
      const scenario = await BACKDOOR_ACTIONS.SCENARIO.scenarios[2](
        moment,
        DATA_PROVIDER_URL,
        ENV().BACKDOOR_USERNAME,
        ENV().BACKDOOR_PASSWORD,
      );

      creatorOwner = scenario.creator.owner;
      namespaceId = scenario.namespaceId;
    });

    it('error messages - paid by', () => {
      ACTIONS.loginTestOwnerWithToken(creatorOwner.token);

      NAMESPACE_SCREEN.visit(creatorOwner.owner.key, namespaceId);
      NAMESPACE_SCREEN.goToAddRecord();
      RECORD_FORM.switchToComplexMode();
      RECORD_FORM_COMPLEX.isVisible();

      RECORD_FORM_COMPLEX.CONFIRM_BUTTON.shouldBeDisabled();
      const testuserForm = RECORD_FORM_COMPLEX.PAID_BY('testuser')
        .OPEN_AMOUNT_FORM();
      testuserForm.COST().shouldHaveErrorOutline();
      testuserForm.setCost('5.4');
      testuserForm.COST().shouldNotHaveErrorOutline();

      testuserForm.CURRENCY().shouldNotHaveErrorOutline();
      testuserForm.shouldHaveCurrency('EUR');
      testuserForm.setCurrency('');
      testuserForm.CURRENCY().shouldHaveErrorOutline();
      testuserForm.setCurrency('SIT');
      testuserForm.CURRENCY().shouldNotHaveErrorOutline();
    });

    it('error messages - benefitors', () => {
      ACTIONS.loginTestOwnerWithToken(creatorOwner.token);

      NAMESPACE_SCREEN.visit(creatorOwner.owner.key, namespaceId);
      NAMESPACE_SCREEN.goToAddRecord();
      RECORD_FORM.switchToComplexMode();
      RECORD_FORM_COMPLEX.isVisible();

      RECORD_FORM_COMPLEX.CONFIRM_BUTTON.shouldBeDisabled();
      const testuserForm = RECORD_FORM_COMPLEX.BENEFITORS('jože testnik')
        .OPEN_AMOUNT_FORM();
      testuserForm.COST().shouldHaveErrorOutline();
      testuserForm.setCost('5.4');
      testuserForm.COST().shouldNotHaveErrorOutline();

      testuserForm.CURRENCY().shouldNotHaveErrorOutline();
      testuserForm.shouldHaveCurrency('EUR');
      testuserForm.setCurrency('');
      testuserForm.CURRENCY().shouldHaveErrorOutline();
      testuserForm.setCurrency('SIT');
      testuserForm.CURRENCY().shouldNotHaveErrorOutline();
    });

    it('can not submit with invalid paid by', () => {
      ACTIONS.loginTestOwnerWithToken(creatorOwner.token);

      NAMESPACE_SCREEN.visit(creatorOwner.owner.key, namespaceId);
      NAMESPACE_SCREEN.goToAddRecord();
      RECORD_FORM.switchToComplexMode();
      RECORD_FORM_COMPLEX.isVisible();

      RECORD_FORM_COMPLEX.CONFIRM_BUTTON.shouldBeDisabled();

      RECORD_FORM_COMPLEX.BENEFITORS('jože testnik')
        .OPEN_AMOUNT_FORM()
        .setCost('5.4')
        .setCurrency('SIT');

      RECORD_FORM_COMPLEX.CONFIRM_BUTTON.shouldBeDisabled();

      const testuserForm = RECORD_FORM_COMPLEX.PAID_BY('testuser')
        .OPEN_AMOUNT_FORM();
      RECORD_FORM_COMPLEX.CONFIRM_BUTTON.shouldBeDisabled();

      testuserForm.setCost('5.4');
      RECORD_FORM_COMPLEX.CONFIRM_BUTTON.shouldBeEnabled();

      testuserForm.setCurrency('');
      RECORD_FORM_COMPLEX.CONFIRM_BUTTON.shouldBeDisabled();
      testuserForm.setCurrency('SIT');
      RECORD_FORM_COMPLEX.CONFIRM_BUTTON.shouldBeEnabled();
    });

    it('can not submit with invalid benefitors', () => {
      ACTIONS.loginTestOwnerWithToken(creatorOwner.token);

      NAMESPACE_SCREEN.visit(creatorOwner.owner.key, namespaceId);
      NAMESPACE_SCREEN.goToAddRecord();
      RECORD_FORM.switchToComplexMode();
      RECORD_FORM_COMPLEX.isVisible();

      RECORD_FORM_COMPLEX.CONFIRM_BUTTON.shouldBeDisabled();

      RECORD_FORM_COMPLEX.PAID_BY('testuser')
        .OPEN_AMOUNT_FORM()
        .setCost('5.4')
        .setCurrency('SIT');

      RECORD_FORM_COMPLEX.CONFIRM_BUTTON.shouldBeDisabled();

      const testuserForm = RECORD_FORM_COMPLEX.BENEFITORS('jože testnik')
        .OPEN_AMOUNT_FORM();
      RECORD_FORM_COMPLEX.CONFIRM_BUTTON.shouldBeDisabled();

      testuserForm.setCost('5.4');
      RECORD_FORM_COMPLEX.CONFIRM_BUTTON.shouldBeEnabled();

      testuserForm.setCurrency('');
      RECORD_FORM_COMPLEX.CONFIRM_BUTTON.shouldBeDisabled();
      testuserForm.setCurrency('SIT');
      RECORD_FORM_COMPLEX.CONFIRM_BUTTON.shouldBeEnabled();
    });

    it('can not submit with not matching paid by and benefitors costs', () => {
      ACTIONS.loginTestOwnerWithToken(creatorOwner.token);

      NAMESPACE_SCREEN.visit(creatorOwner.owner.key, namespaceId);
      NAMESPACE_SCREEN.goToAddRecord();
      RECORD_FORM.switchToComplexMode();
      RECORD_FORM_COMPLEX.isVisible();

      RECORD_FORM_COMPLEX.CONFIRM_BUTTON.shouldBeDisabled();

      RECORD_FORM_COMPLEX.PAID_BY('testuser')
        .OPEN_AMOUNT_FORM()
        .setCost('5.4')
        .setCurrency('SIT');

      RECORD_FORM_COMPLEX.BENEFITORS('jože testnik')
        .OPEN_AMOUNT_FORM()
        .setCost('1.8')
        .setCurrency('SIT');

      RECORD_FORM_COMPLEX.confirm();
      RECORD_FORM_COMPLEX.NOT_MATCHING_COST_MODE_MODAL.isVisible();
      RECORD_FORM_COMPLEX.NOT_MATCHING_COST_MODE_MODAL.toSay('Vrednost plačil v valuti SIT = 5.4');
      RECORD_FORM_COMPLEX.NOT_MATCHING_COST_MODE_MODAL.toSay('Vrednost dolga v valuti SIT = 1.8');
      RECORD_FORM_COMPLEX.NOT_MATCHING_COST_MODE_MODAL.close();

      RECORD_FORM_COMPLEX.BENEFITORS('jože testnik')
        .AMOUNT_FORM(0)
        .setCost('5.4')
        .setCurrency('SIT');

      RECORD_FORM_COMPLEX.confirm();
      RECORD_LIST.RECORD_BY_COST('5.4').exists();
    });
  });

});