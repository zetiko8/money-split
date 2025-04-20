import { EDIT_NAMESPACE_FORM, NAMESPACE_SCREEN } from '../support/app.po';
import { BACKDOOR_ACTIONS, TestOwner, TestScenarioNamespace } from '@angular-monorepo/backdoor';
import { ENV } from '../support/config';
import { ACTIONS } from '../support/actions';

const DATA_PROVIDER_URL = ENV().DATA_PROVIDER_URL;

describe('Edit a namespace', () => {

  describe('displays correct data',() => {
    let namespaceId!: number;
    let creatorOwner!: TestOwner;
    let scenario!: TestScenarioNamespace;
    // let avatarData!: AvatarData;
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

      // avatarData = await creatorOwner
      //   .getAvatar(creatorOwner.owner.avatarId);

      await ACTIONS.loginTestOwner(creatorOwner);
      EDIT_NAMESPACE_FORM.visit(creatorOwner.owner.key, namespaceId);
    });

    it('displays correct name', () => {
      EDIT_NAMESPACE_FORM.nameIs('testnamespace');
    });
  });

  describe('can edit a namespace',() => {
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

      await ACTIONS.loginTestOwner(creatorOwner);
    });

    it('can edit a namespace name', () => {
      EDIT_NAMESPACE_FORM.visit(creatorOwner.owner.key, namespaceId);
      EDIT_NAMESPACE_FORM.setName('changed');
      EDIT_NAMESPACE_FORM.submit();
      NAMESPACE_SCREEN.userIsOn('changed');
    });
  });

  describe('can edit a namespace image',() => {
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

      await ACTIONS.loginTestOwner(creatorOwner);
    });

    it('can edit a namespace image', () => {
      EDIT_NAMESPACE_FORM.visit(creatorOwner.owner.key, namespaceId);
      EDIT_NAMESPACE_FORM.uploadAvatar('TestImage1.PNG');
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000);
      EDIT_NAMESPACE_FORM.submit();
      NAMESPACE_SCREEN.goToEditNamespace();
      EDIT_NAMESPACE_FORM.avatarIsHttpImage();
      EDIT_NAMESPACE_FORM.uploadAvatar('TestImage2.PNG');
      EDIT_NAMESPACE_FORM.avatarIsUploadedImage();

      EDIT_NAMESPACE_FORM.deleteUploadedImage();
      EDIT_NAMESPACE_FORM.avatarIsColoredAvatar();

      EDIT_NAMESPACE_FORM.cancel();
      EDIT_NAMESPACE_FORM.avatarIsHttpImage();
      EDIT_NAMESPACE_FORM.setAvatarColor('#9a8619');
      EDIT_NAMESPACE_FORM.avatarIsColoredAvatar();
    });
  });

  describe('namespace image validation',() => {
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

      await ACTIONS.loginTestOwner(creatorOwner);
    });

    it('can edit a namespace image', () => {
      EDIT_NAMESPACE_FORM.visit(creatorOwner.owner.key, namespaceId);
      EDIT_NAMESPACE_FORM.uploadAvatar('TestImage1.PNG');
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000);
      EDIT_NAMESPACE_FORM.submit();
      NAMESPACE_SCREEN.goToEditNamespace();
      EDIT_NAMESPACE_FORM.avatarIsHttpImage();
      EDIT_NAMESPACE_FORM.uploadAvatar('TestImage2.PNG');
      EDIT_NAMESPACE_FORM.avatarIsUploadedImage();

      EDIT_NAMESPACE_FORM.deleteUploadedImage();
      EDIT_NAMESPACE_FORM.avatarIsColoredAvatar();

      EDIT_NAMESPACE_FORM.cancel();
      EDIT_NAMESPACE_FORM.avatarIsHttpImage();
      EDIT_NAMESPACE_FORM.setAvatarColor('#9a8619');
      EDIT_NAMESPACE_FORM.avatarIsColoredAvatar();
    });
  });

  describe('navigation',() => {
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

      await ACTIONS.loginTestOwner(creatorOwner);
    });

    it('navigation', () => {
      // navigates there
      NAMESPACE_SCREEN.visit(creatorOwner.owner.key, namespaceId);
      NAMESPACE_SCREEN.goToEditNamespace();
      EDIT_NAMESPACE_FORM.setName('changed');
      EDIT_NAMESPACE_FORM.submit();

      // navigates back after submition
      NAMESPACE_SCREEN.userIsOn('changed');

      // navigates back to edit with back button
      NAMESPACE_SCREEN.goToEditNamespace();
      EDIT_NAMESPACE_FORM.goBack();
      NAMESPACE_SCREEN.userIsOn('changed');
    });
  });
});