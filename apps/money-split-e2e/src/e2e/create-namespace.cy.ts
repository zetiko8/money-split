import { CREATE_NAMESPACE_FORM, NAMESPACE_SCREEN, REALM_SCREEN } from '../support/app.po';
import { ACTIONS } from '../support/actions';
import { TestOwner } from '@angular-monorepo/backdoor';
import { ENV } from '../support/config';

const DATA_PROVIDER_URL = ENV().DATA_PROVIDER_URL;

describe('Create a namespace', () => {

  describe('create a namespace',() => {
    let testOwner!: TestOwner;

    before(async () => {
      testOwner = new TestOwner(
        DATA_PROVIDER_URL,
        'testowner',
        'testpassword',
      );
      await testOwner.dispose();
      await testOwner.register();
      await ACTIONS.loginTestOwner(testOwner);
    });

    it('can create a namespace', () => {
      REALM_SCREEN.visit(testOwner.owner.key);
      REALM_SCREEN.goToCreateANamespace();
      CREATE_NAMESPACE_FORM.setName('testnamespace');
      CREATE_NAMESPACE_FORM.submit();
      NAMESPACE_SCREEN.userIsOn('testnamespace');
    });
  });
});