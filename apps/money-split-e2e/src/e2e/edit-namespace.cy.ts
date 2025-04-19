import { CREATE_NAMESPACE_FORM, EDIT_NAMESPACE_FORM, NAMESPACE_SCREEN, REALM_SCREEN } from '../support/app.po';
import { ACTIONS } from '../support/actions';
import { TestOwner } from '@angular-monorepo/backdoor';
import { ENV } from '../support/config';

const DATA_PROVIDER_URL = ENV().DATA_PROVIDER_URL;

describe('Edit a namespace', () => {

  describe('edit a namespace',() => {
    let namespaceId!: number;
    let creatorOwner!: TestOwner;

    before(async () => {
      creatorOwner = new TestOwner(
        DATA_PROVIDER_URL,
        'testuser',
        'testpassword',
      );
      await creatorOwner.dispose();
      await creatorOwner.register();

      const namespace = await creatorOwner.createNamespace('testnamespace');
      namespaceId = namespace.id;

      await creatorOwner.addOwnerToNamespace(
        namespaceId,
        {
          name: 'atestuser1',
        },
      );
      await creatorOwner.addOwnerToNamespace(
        namespaceId,
        {
          name: 'btestuser2',
        },
      );
      await creatorOwner.addOwnerToNamespace(
        namespaceId,
        {
          name: 'ctestuser3',
        },
      );

      await ACTIONS.loginTestOwner(creatorOwner);
    });

    it('can edit a namespace', () => {
      NAMESPACE_SCREEN.visit(creatorOwner.owner.key, namespaceId);
      NAMESPACE_SCREEN.goToEditNamespace();
      EDIT_NAMESPACE_FORM.setName('testnamespace changed');
      EDIT_NAMESPACE_FORM.submit();
      NAMESPACE_SCREEN.userIsOn('testnamespace changed');
    });
  });
});