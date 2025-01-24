import { Owner } from '@angular-monorepo/entities';
import { prepareRealm } from '../support/prepare';
import { CREATE_NAMESPACE_FORM, NAMESPACE_SCREEN, REALM_SCREEN } from '../support/app.po';
import { ACTIONS } from '../support/actions';

describe('Create a namespace', () => {

  describe('create a namespace',() => {
    let owner!: Owner;

    const scenario = prepareRealm(
      {  username: 'testuser'},
    );

    before(() => {
      ACTIONS.deleteNamespaceByName('testnamespace');
      scenario
        .before()
        .then(data => {
          owner = data.owner;
        });
    });

    after(() => {
      scenario.after();
      ACTIONS.deleteNamespaceByName('testnamespace');
    });

    it('can create a namespace', () => {
      REALM_SCREEN.visit(owner.key);
      REALM_SCREEN.goToCreateANamespace();
      CREATE_NAMESPACE_FORM.setName('testnamespace');
      CREATE_NAMESPACE_FORM.submit();
      NAMESPACE_SCREEN.userIsOn('testnamespace');
    });
  });
});