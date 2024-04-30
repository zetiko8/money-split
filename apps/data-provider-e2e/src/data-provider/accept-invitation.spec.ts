import axios from 'axios';
import { DATA_PROVIDER_URL, TestContext, fnCall, queryDb, smoke } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { acceptInvitationApi } from '@angular-monorepo/api-interface';

const api = acceptInvitationApi();
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
    await smoke(API_NAME, async () => await axios.post(
      `${DATA_PROVIDER_URL}/app/invitation/${invitationKey}/accept`,
    ));
  });
  it('requires name to be provided', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/invitation/${invitationKey}/accept`,
        {},
        invitedTestContext.authHeaders()))
      .throwsError(ERROR_CODE.INVALID_REQUEST);
  });
  it('requires name to be a string', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/invitation/${invitationKey}/accept`,
        { name: 3 },
        invitedTestContext.authHeaders()))
      .throwsError(ERROR_CODE.INVALID_REQUEST);
  });
  it('not found invitation key', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/invitation/${'not-found'}/accept`,
        { name: 'invitedowner' },
        invitedTestContext.authHeaders()))
      .throwsError(ERROR_CODE.RESOURCE_NOT_FOUND);
  });
  it('throws 401 with invalid token', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/invitation/${invitationKey}/accept`,
        { name: 'invitedowner' },
      ))
      .throwsError(ERROR_CODE.UNAUTHORIZED);
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/invitation/${invitationKey}/accept`,
        { name: 'invitedowner' },
        {
          headers: {
            'Authorization': 'Bearer invalid',
          },
        },
      ))
      .throwsError(ERROR_CODE.UNAUTHORIZED);
  });
  it('returns an invitation', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/invitation/${invitationKey}/accept`,
        { name: 'invitedowner' },
        invitedTestContext.authHeaders()))
      .result((result => {
        expect(result).toEqual({
          namespaceId: namespaceId,
          accepted: true,
          rejected: false,
          id: expect.any(Number),
          email: 'test@email.com',
          created: expect.any(String),
          edited: expect.any(String),
          createdBy: inviterTestContext.ownerId,
          editedBy: invitedTestContext.ownerId,
          invitationKey: invitationKey,
        });
      }));
  });
  it.todo('edited date is corrected');
  it.todo('the owner accepting the invite can not be the same as the inviter');
  describe('dbState', () => {
    let invitationId!: number;
    beforeEach(async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/invitation/${invitationKey}/accept`,
          { name: 'inviteduser' },
          invitedTestContext.authHeaders()))
        .result((async res => {
          invitationId = res.id;
        }));
    });
    it('saves invitation in the db', async () => {
      const response = await queryDb(
        `
        SELECT * FROM Invitation
        WHERE id = ${invitationId}
        `,
      );
      expect(response[0]).toEqual({
        namespaceId: namespaceId,
        accepted: 1,
        rejected: 0,
        id: expect.any(Number),
        email: 'test@email.com',
        created: expect.any(String),
        edited: expect.any(String),
        createdBy: inviterTestContext.ownerId,
        editedBy: invitedTestContext.ownerId,
        invitationKey: expect.any(String),
      });
      expect(response).toHaveLength(1);
    });
    it('adds owner to the namespace', async () => {
      const response = await queryDb(
        `
        SELECT * FROM NamespaceOwner
        WHERE namespaceId = ${namespaceId}
        AND ownerId = ${invitedTestContext.ownerId}
        `,
      );
      expect(response[0]).toEqual({
        namespaceId: namespaceId,
        ownerId: invitedTestContext.ownerId,
      });
      expect(response).toHaveLength(1);
    });
    it('adds user to the namespace', async () => {
      const response = await queryDb(
        `
        SELECT * FROM \`User\`
        WHERE namespaceId = ${namespaceId}
        AND ownerId = ${invitedTestContext.ownerId}
        `,
      );
      expect(response[0]).toEqual({
        namespaceId: namespaceId,
        ownerId: invitedTestContext.ownerId,
        avatarId: expect.any(Number),
        id: expect.any(Number),
        name: 'inviteduser',
      });
      expect(response).toHaveLength(1);
    });
  });
});
