import axios from 'axios';
import { DATA_PROVIDER_URL, TestContext, fnCall, smoke } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { getInvitationViewApi } from '@angular-monorepo/api-interface';

const api = getInvitationViewApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {
  let namespaceId!: number;
  let invitationKey!: string;
  let inviterTestContext: TestContext;
  let invitedTestContext: TestContext;
  beforeEach(async () => {
    try {
      inviterTestContext = new TestContext();
      await inviterTestContext
        .deleteOwner('testowner');
      await inviterTestContext
        .deleteOwner('invitedowner');
      await inviterTestContext
        .registerOwner('testowner', 'testpassword');
      await inviterTestContext
        .createNamespace('testnamespace');
      await inviterTestContext
        .inviteOwnerToNamespace(0, 'test@email.com');

      const invitation = inviterTestContext.namespaces[0].invitations[0];
      invitedTestContext = invitation.ownerTestContext;
      await invitedTestContext
        .registerOwner('invitedowner', 'testpassword');
      await invitedTestContext.login();

      namespaceId = inviterTestContext.namespaces[0].namespaceId;
      invitationKey = invitation.invitationKey;
    } catch (error) {
      throw Error('beforeAll error: ' + error.message);
    }
  });

  afterEach(async () => {
    try {
      await inviterTestContext.deleteNamespaces();
    } catch (error) {
      throw Error('afterEach error: ' + error.message);
    }
  });

  it('smoke', async () => {
    await smoke(API_NAME, async () => await axios.get(
      `${DATA_PROVIDER_URL}/app/invitation/${invitationKey}`,
    ));
  });
  it('not found invitation key', async () => {
    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/invitation/${'not-found'}`,
        invitedTestContext.authHeaders()))
      .throwsError(ERROR_CODE.RESOURCE_NOT_FOUND);
  });
  it('throws 401 with invalid token', async () => {
    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/invitation/${invitationKey}`,
      ))
      .throwsError(ERROR_CODE.UNAUTHORIZED);
    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/invitation/${invitationKey}`,
        {
          headers: {
            'Authorization': 'Bearer invalid',
          },
        },
      ))
      .throwsError(ERROR_CODE.UNAUTHORIZED);
  });
  it('returns an invitationView', async () => {
    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/invitation/${invitationKey}`,
        invitedTestContext.authHeaders()))
      .result((result => {
        expect(result).toEqual({
          accepted: false,
          rejected: false,
          id: expect.any(Number),
          email: 'test@email.com',
          created: expect.any(String),
          edited: expect.any(String),
          createdBy: inviterTestContext.ownerId,
          editedBy: inviterTestContext.ownerId,
          invitationKey: invitationKey,
          namespace: {
            id: namespaceId,
            name: 'testnamespace',
            avatarId: expect.any(Number),
          },
        });
      }));
  });
  it.todo('throw error if invitation was already accepted');
  it.todo('the owner accepting the invite can not be the same as the inviter');
});
