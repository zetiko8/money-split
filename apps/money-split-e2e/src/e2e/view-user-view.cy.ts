import { MEMBERS_TAB, NAMESPACE_SCREEN, VIEW_USER_VIEW } from '../support/app.po';
import * as moment from 'moment';
import { BACKDOOR_ACTIONS, TestOwner } from '@angular-monorepo/backdoor';
import { ACTIONS } from '../support/actions';
import { User } from '@angular-monorepo/entities';

const DATA_PROVIDER_URL = Cypress.env()['DATA_PROVIDER_URL'];

describe('Namespace user view', () => {

  describe('displays user',() => {
    let namespaceId!: number;
    let creatorOwner!: TestOwner;
    let user!: User;

    before(async () => {
      const scenario = await BACKDOOR_ACTIONS.SCENARIO.scenarios[2](
        moment,
        DATA_PROVIDER_URL,
        Cypress.env()['BACKDOOR_USERNAME'],
        Cypress.env()['BACKDOOR_PASSWORD'],
      );

      creatorOwner = scenario.creator.owner;
      namespaceId = scenario.namespaceId;
      user = scenario.nonCreatorUsers[0].user;

      await ACTIONS.loginTestOwner(creatorOwner);
    });

    it('username', () => {
      NAMESPACE_SCREEN.visit(creatorOwner.owner.key, namespaceId);
      NAMESPACE_SCREEN.openMembersTab();
      MEMBERS_TAB.NAMESPACE_USER.byUsername(user.name).click();
      VIEW_USER_VIEW.userIsOnPage(user.name);
    });
  });

  describe.only('navigation',() => {
    let namespaceId!: number;
    let namespaceName!: string;
    let creatorOwner!: TestOwner;
    let user!: User;

    before(async () => {
      const scenario = await BACKDOOR_ACTIONS.SCENARIO.scenarios[2](
        moment,
        DATA_PROVIDER_URL,
        Cypress.env()['BACKDOOR_USERNAME'],
        Cypress.env()['BACKDOOR_PASSWORD'],
      );

      creatorOwner = scenario.creator.owner;
      namespaceId = scenario.namespaceId;
      namespaceName = scenario.namespace.name;
      user = scenario.nonCreatorUsers[0].user;

      await ACTIONS.loginTestOwner(creatorOwner);
    });

    it('is going back to members tab', () => {
      NAMESPACE_SCREEN.visit(creatorOwner.owner.key, namespaceId);
      NAMESPACE_SCREEN.openMembersTab();
      MEMBERS_TAB.NAMESPACE_USER.byUsername(user.name).click();
      VIEW_USER_VIEW.userIsOnPage(user.name);
      VIEW_USER_VIEW.goBack();
      NAMESPACE_SCREEN.userIsOn(namespaceName);
      NAMESPACE_SCREEN.userIsOnTab('users');
    });
  });

});