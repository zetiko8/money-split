import axios from 'axios';
import { BACKDOOR_PASSWORD, BACKDOOR_USERNAME, DATA_PROVIDER_URL, fnCall, queryDb, smoke, testWrap } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { acceptInvitationApi } from '@angular-monorepo/api-interface';
import { MockDataMachine, MockDataState, TestOwner } from '@angular-monorepo/backdoor';

const api = acceptInvitationApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {
  let namespaceId!: number;
  let testOwner!: TestOwner;
  let inviterOwnerId!: number;
  let invitationKey!: string;
  let machineState!: MockDataState;

  beforeEach(async () => {
    try {
      const machine = new MockDataMachine(
        DATA_PROVIDER_URL, BACKDOOR_USERNAME, BACKDOOR_PASSWORD);

      // dispose any existing owners with the same name
      await machine.dispose('creator');
      await machine.dispose('test@email.com');

      // Create new cluster and namespace
      await machine.createNewCluster('creator', 'testpassword');
      await machine.createNewNamespace('testnamespace');

      // Create invitation for inviteduser
      machineState = await machine.createNewInvitation('test@email.com');
      const invitation = machineState.getInvitationByEmail('test@email.com');
      invitationKey = invitation.invitationKey;

      // Get namespace ID and owners
      namespaceId = machineState.selectedNamespace!.id;
      inviterOwnerId = (await machineState.getUserOwnerByName('creator')).owner.id;

      testOwner = await MockDataMachine
        .createNewOwnerAndLogHimIn(DATA_PROVIDER_URL, 'test@email.com');
    } catch (error) {
      throw Error('beforeAll error: ' + error.message);
    }
  });

  describe('smoke', () => {
    testWrap('', 'smoke', async () => {
      await smoke(API_NAME, async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/invitation/${invitationKey}/accept`,
      ));
    });
  });

  describe('validation', () => {
    testWrap('', 'requires name to be provided', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/invitation/${invitationKey}/accept`,
          {},
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });
    testWrap('', 'requires name to be a string', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/invitation/${invitationKey}/accept`,
          { name: 3 },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });
    testWrap('', 'not found invitation key', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/invitation/${'not-found'}/accept`,
          { name: 'invitedowner' },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.RESOURCE_NOT_FOUND);
    });
    testWrap('', 'throws 401 with invalid token', async () => {
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
    testWrap('', 'returns an invitation', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/invitation/${invitationKey}/accept`,
          { name: 'invitedowner' },
          testOwner.authHeaders()))
        .result((result => {
          expect(result).toEqual({
            namespaceId: namespaceId,
            accepted: true,
            rejected: false,
            id: expect.any(Number),
            email: 'test@email.com',
            created: expect.any(String),
            edited: expect.any(String),
            createdBy: inviterOwnerId,
            editedBy: testOwner.owner.id,
            invitationKey: invitationKey,
          });
        }));
    });
    testWrap('', 'trims the name and does not allow empty after trimming', async () => {
    // Should save trimmed name
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/invitation/${invitationKey}/accept`,
          { name: '   inviteduser   ' },
          testOwner.authHeaders()))
        .result(() => {});

      // Check by querying the DB
      const userRes = await queryDb(
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        `SELECT * FROM \`User\` 
                WHERE namespaceId = ${namespaceId} 
                AND ownerId = ${testOwner.owner.id}`,
      );
      expect(userRes[0].name).toBe('inviteduser');

      // Should not allow name with only spaces
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/invitation/${invitationKey}/accept`,
          { name: '   ' },
          testOwner.authHeaders()))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });
    it.todo('edited date is corrected');
    it.todo('the owner accepting the invite can not be the same as the inviter');

  });

  describe('dbState', () => {
    let invitationId!: number;
    beforeEach(async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/invitation/${invitationKey}/accept`,
          { name: 'inviteduser' },
          testOwner.authHeaders()))
        .result((async res => {
          invitationId = res.id;
        }));
    });
    testWrap('', 'saves invitation in the db', async () => {
      const response = await queryDb(
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
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
        createdBy: inviterOwnerId,
        editedBy: testOwner.owner.id,
        invitationKey: expect.any(String),
      });
      expect(response).toHaveLength(1);
    });
    testWrap('', 'adds owner to the namespace', async () => {
      const response = await queryDb(
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        `
        SELECT * FROM NamespaceOwner
        WHERE namespaceId = ${namespaceId}
        AND ownerId = ${testOwner.owner.id}
        `,
      );
      expect(response[0]).toEqual({
        namespaceId: namespaceId,
        ownerId: testOwner.owner.id,
      });
      expect(response).toHaveLength(1);
    });
    testWrap('', 'adds user to the namespace', async () => {
      const response = await queryDb(
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        `
        SELECT * FROM \`User\`
        WHERE namespaceId = ${namespaceId}
        AND ownerId = ${testOwner.owner.id}
        `,
      );
      expect(response[0]).toEqual({
        namespaceId: namespaceId,
        ownerId: testOwner.owner.id,
        avatarId: expect.any(Number),
        id: expect.any(Number),
        name: 'inviteduser',
      });
      expect(response).toHaveLength(1);
    });
  });
});
