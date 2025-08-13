import axios from 'axios';
import { DATA_PROVIDER_URL, fnCall, smoke } from '../test-helpers';
import { ERROR_CODE, Invitation } from '@angular-monorepo/entities';
import { getInvitationViewApi } from '@angular-monorepo/api-interface';
import { MockDataMachine, MockDataState, TestOwner } from '@angular-monorepo/backdoor';

const api = getInvitationViewApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {
  let namespaceId!: number;
  let testOwner!: TestOwner;
  let creatorId!: number;
  let invitation!: Invitation;
  let machine!: MockDataMachine;
  let machineState!: MockDataState;

  beforeEach(async () => {
    try {
      machine = new MockDataMachine(DATA_PROVIDER_URL);

      // Dispose existing test data
      await MockDataMachine.dispose(DATA_PROVIDER_URL, 'creator');
      await MockDataMachine.dispose(DATA_PROVIDER_URL, 'test@email.com');

      // Create cluster and namespace with creator
      machineState = await machine.createNewCluster('creator', 'testpassword');
      machineState = await machine.createNewNamespace('testnamespace');
      namespaceId = machineState.selectedNamespace!.id;
      creatorId = (await machineState.getUserOwnerByName('creator')).owner.id;

      // Create invitation for test owner
      machineState = await machine.createNewInvitation('test@email.com');
      invitation = machineState.getInvitationByEmail('test@email.com');

      // Create test owner but don't accept invitation yet
      testOwner = await MockDataMachine.createNewOwnerAndLogHimIn(DATA_PROVIDER_URL, 'test@email.com', 'testpassword');
    } catch (error) {
      throw Error('beforeAll error: ' + error.message);
    }
  });

  describe('smoke', () => {
    it('smoke', async () => {
      await smoke(API_NAME, async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/invitation/${invitation.invitationKey}`,
      ));
    });
  });

  describe('validation', () => {
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
          {
            headers: {
              'Authorization': 'Bearer invalid',
            },
          },
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });

    it.todo('throw error if invitation was already accepted');
    it.todo('the owner accepting the invite can not be the same as the inviter');
  });

  describe('happy path', () => {
    it('allow unauthenticated access', async () => {
      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/invitation/${invitation.invitationKey}`,
        ))
        .throwsNoError();
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
            createdBy: creatorId,
            editedBy: creatorId,
            invitationKey: invitation.invitationKey,
            namespace: {
              id: namespaceId,
              name: 'testnamespace',
              avatarId: expect.any(Number),
            },
          });
        }));
    });
  });
});
