import axios from 'axios';
import { DATA_PROVIDER_URL, fnCall, queryDb, smoke } from '../test-helpers';
import { acceptInvitationApi } from '@angular-monorepo/api-interface';
import { TestOwner } from '@angular-monorepo/backdoor';
import { ERROR_CODE } from '@angular-monorepo/entities';

const api = acceptInvitationApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {
  let namespaceId!: number;
  let userId!: number;
  let creatorUserId!: number;
  let testOwner!: TestOwner;
  let creatorOwner!: TestOwner;
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
      const invitation =
        await creatorOwner.inviteToNamespace('test@email.com', namespaceId);
      testOwner = new TestOwner(
        DATA_PROVIDER_URL,
        'invitedowner',
        'testpassword,',
      );
      await testOwner.dispose();
      await testOwner.register();
      await testOwner.acceptInvitation('inviteduser', invitation.invitationKey);
      const user
        = await testOwner.getUserForNamespace(namespaceId);
      userId = user.id;
      const creatorUser
          = await testOwner.getUserForNamespace(namespaceId);
      creatorUserId = creatorUser.id;
    } catch (error) {
      throw Error('beforeAll error: ' + error.message);
    }
  });

  it('smoke', async () => {
    await smoke(API_NAME, async () => await axios.post(
      `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add`,
    ));
  });
  it('requires cost to be provided', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add`,
        {
          currency: 'SIT',
          paidBy: [ userId ],
          benefitors: [ creatorUserId ],
        },
        testOwner.authHeaders()))
      .throwsError(ERROR_CODE.INVALID_REQUEST);
  });
  it('requires cost to be a number', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add`,
        {
          cost: 'invalid',
          currency: 'SIT',
          paidBy: [ userId ],
          benefitors: [ creatorUserId ],
        },
        testOwner.authHeaders()))
      .throwsError(ERROR_CODE.INVALID_REQUEST);
  });
  it('requires paidBy to be provided', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add`,
        {
          cost: 3,
          currency: 'SIT',
          benefitors: [ creatorUserId ],
        },
        testOwner.authHeaders()))
      .throwsError(ERROR_CODE.INVALID_REQUEST);
  });
  it('requires paidBy to be a bigint array', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add`,
        {
          cost: 3,
          currency: 'SIT',
          paidBy: [ 0.12 ],
          benefitors: [ creatorUserId ],
        },
        testOwner.authHeaders()))
      .throwsError(ERROR_CODE.INVALID_REQUEST);
  });
  it('requires benefitors to be provided', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add`,
        {
          cost: 3,
          currency: 'SIT',
          paidBy: [ userId ],
        },
        testOwner.authHeaders()))
      .throwsError(ERROR_CODE.INVALID_REQUEST);
  });
  it('requires benefitors to be a bigint array', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add`,
        {
          cost: 3,
          currency: 'SIT',
          paidBy: [ userId ],
          benefitors: [ 0.12 ],
        },
        testOwner.authHeaders()))
      .throwsError(ERROR_CODE.INVALID_REQUEST);
  });
  it('requires currency to be provided', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add`,
        {
          cost: 3,
          paidBy: [ userId ],
          benefitors: [ creatorUserId ],
        },
        testOwner.authHeaders()))
      .throwsError(ERROR_CODE.INVALID_REQUEST);
  });
  it('requires currency to be a string', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add`,
        {
          cost: 3,
          currency: 4,
          paidBy: [ userId ],
          benefitors: [ creatorUserId ],
        },
        testOwner.authHeaders()))
      .throwsError(ERROR_CODE.INVALID_REQUEST);
  });
  it('invalid namespaceId', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${999}/${userId}/add`,
        {
          cost: 3,
          currency: 'SIT',
          paidBy: [ userId ],
          benefitors: [ creatorUserId ],
        },
        testOwner.authHeaders()))
      .throwsError(ERROR_CODE.UNAUTHORIZED);
  });
  it('invalid userId', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${999}/add`,
        {
          cost: 3,
          currency: 'SIT',
          paidBy: [ userId ],
          benefitors: [ creatorUserId ],
        },
        testOwner.authHeaders()))
      .throwsError(ERROR_CODE.UNAUTHORIZED);
  });
  it('throws 401 with invalid token', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add`,
        {
          cost: 3,
          currency: 'SIT',
          paidBy: [ userId ],
          benefitors: [ creatorUserId ],
        },
      ))
      .throwsError(ERROR_CODE.UNAUTHORIZED);
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add`,
        {
          cost: 3,
          currency: 'SIT',
          paidBy: [ userId ],
          benefitors: [ creatorUserId ],
        },
        {
          headers: {
            'Authorization': 'Bearer invalid',
          },
        },
      ))
      .throwsError(ERROR_CODE.UNAUTHORIZED);
  });
  it('returns a record', async () => {
    await fnCall(API_NAME,
      async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add`,
        {
          cost: 3,
          currency: 'SIT',
          paidBy: [ userId ],
          benefitors: [ creatorUserId ],
        },
        testOwner.authHeaders()))
      .result((result => {
        expect(result).toEqual({
          namespaceId: namespaceId,
          settlementId: null,
          id: expect.any(Number),
          data: {
            benefitors: [ creatorUserId ],
            paidBy: [ userId ],
            cost: 3,
            currency: 'SIT',
          },
          created: expect.any(String),
          edited: expect.any(String),
          createdBy: userId,
          editedBy: userId,
        });
      }));
  });
  it.todo('edited date is corrected');
  describe('dbState', () => {
    let recordId!: number;
    beforeEach(async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${testOwner.owner.key}/namespace/${namespaceId}/${userId}/add`,
          {
            benefitors: [ creatorUserId ],
            paidBy: [ userId ],
            cost: 3,
            currency: 'SIT',
          },
          testOwner.authHeaders()))
        .result((async res => {
          recordId = res.id;
        }));
    });
    it('saves recird in the db', async () => {
      const response = await queryDb(
        `
        SELECT * FROM \`Record\`
        WHERE id = ${recordId}
        `,
      );
      expect(response[0]).toEqual({
        namespaceId: namespaceId,
        settlementId: null,
        id: recordId,
        data: JSON.stringify({
          benefitors: [ creatorUserId ],
          paidBy: [ userId ],
          cost: 3,
          currency: 'SIT',
        }),
        created: expect.any(String),
        edited: expect.any(String),
        createdBy: userId,
        editedBy: userId,
      });
      expect(response).toHaveLength(1);
    });
  });
});
