import axios from 'axios';
import { DATA_PROVIDER_URL, fnCall, smoke } from '../test-helpers';
import { ERROR_CODE, Invitation } from '@angular-monorepo/entities';
import { getInvitationViewApi } from '@angular-monorepo/api-interface';
import { TestOwner } from '@angular-monorepo/backdoor';

const api = getInvitationViewApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {
  let namespaceId!: number;
  let testOwner!: TestOwner;
  let creatorOwner!: TestOwner;
  let invitation!: Invitation;
  beforeEach(async () => {
    try {
      creatorOwner = new TestOwner(
        DATA_PROVIDER_URL,
        'creator',
        'testpassword',
      );
      await creatorOwner.dispose();
      await creatorOwner.register();
      const namespace = await creatorOwner.createNamespace('testnamespace');
      namespaceId = namespace.id;
      invitation =
        await creatorOwner.inviteToNamespace('test@email.com', namespaceId);
      testOwner = new TestOwner(
        DATA_PROVIDER_URL,
        'invitedowner',
        'testpassword,',
      );
      await testOwner.dispose();
      await testOwner.register();
    } catch (error) {
      throw Error('beforeAll error: ' + error.message);
    }
  });

  it('smoke', async () => {
    await smoke(API_NAME, async () => await axios.get(
      `${DATA_PROVIDER_URL}/app/invitation/${invitation.invitationKey}`,
    ));
  });
  it('not found invitation key', async () => {
    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/invitation/${'not-found'}`,
        testOwner.authHeaders(),
      ))
      .throwsError(ERROR_CODE.RESOURCE_NOT_FOUND);
  });
  it('throws 401 with invalid token', async () => {
    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/invitation/${invitation.invitationKey}`,
      ))
      .throwsError(ERROR_CODE.UNAUTHORIZED);
    await fnCall(API_NAME,
      async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/invitation/${invitation.invitationKey}`,
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
        `${DATA_PROVIDER_URL}/app/invitation/${invitation.invitationKey}`,
        testOwner.authHeaders()),
    )
      .result((result => {
        expect(result).toEqual({
          accepted: false,
          rejected: false,
          id: expect.any(Number),
          email: 'test@email.com',
          created: expect.any(String),
          edited: expect.any(String),
          createdBy: creatorOwner.owner.id,
          editedBy: creatorOwner.owner.id,
          invitationKey: invitation.invitationKey,
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
