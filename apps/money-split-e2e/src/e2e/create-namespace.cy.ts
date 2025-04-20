import { CREATE_NAMESPACE_FORM, NAMESPACE_SCREEN, REALM_SCREEN } from '../support/app.po';
import { ACTIONS } from '../support/actions';
import { TestOwner } from '@angular-monorepo/backdoor';
import { ENV } from '../support/config';

const DATA_PROVIDER_URL = ENV().DATA_PROVIDER_URL;

describe('Create a namespace', () => {

  describe('create a namespace', () => {
    let testOwner!: TestOwner;
    let token!: string;

    beforeEach(async () => {
      testOwner = new TestOwner(
        DATA_PROVIDER_URL,
        'testowner',
        'testpassword',
      );
      await testOwner.dispose();
      await testOwner.register();
      token = await testOwner.login();
    });

    it('can create a namespace', () => {
      ACTIONS.loginTestOwnerWithToken(token);
      REALM_SCREEN.visit(testOwner.owner.key);
      REALM_SCREEN.goToCreateANamespace();
      CREATE_NAMESPACE_FORM.setName('testnamespace');
      CREATE_NAMESPACE_FORM.submit();
      NAMESPACE_SCREEN.userIsOn('testnamespace');
    });

    it.only('validates namespace name', () => {
      ACTIONS.loginTestOwnerWithToken(token);
      CREATE_NAMESPACE_FORM.visit(testOwner.owner.key);

      // can not submit without name
      CREATE_NAMESPACE_FORM.expectSubmitButtonToBeDisabled();

      // empty name
      CREATE_NAMESPACE_FORM.setName('  ');
      CREATE_NAMESPACE_FORM.expectSubmitButtonToBeDisabled();

      // name too long
      CREATE_NAMESPACE_FORM.setName('a'.repeat(21));
      CREATE_NAMESPACE_FORM.expectSubmitButtonToBeDisabled();
      CREATE_NAMESPACE_FORM.expectNameError('Predolg vnos');

      // valid name
      CREATE_NAMESPACE_FORM.setName('a'.repeat(20));
      CREATE_NAMESPACE_FORM.submit();
      NAMESPACE_SCREEN.userIsOn('a'.repeat(20));
    });
  });
});