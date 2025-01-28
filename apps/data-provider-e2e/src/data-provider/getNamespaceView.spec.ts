import axios from 'axios';
import { DATA_PROVIDER_URL, expectDate, fnCall, smoke, testEnv, throwBeforeEachError } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { getNamespaceViewApi } from '@angular-monorepo/api-interface';
import { BACKDOOR_ACTIONS, TestOwner, TestScenarioNamespace } from '@angular-monorepo/backdoor';
import moment from 'moment';

const api = getNamespaceViewApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {

  describe('basics', () => {
    let ownerKey!: string;
    let ownerKeyOtherOwner!: string;
    let testOwner!: TestOwner;
    let otherOwner!: TestOwner;
    let namespaceId!: number;
    beforeEach(async () => {
      testOwner = new TestOwner(
        DATA_PROVIDER_URL,
        'testowner',
        'testpassword',
      );
      await testOwner.dispose();
      await testOwner.register();
      otherOwner = new TestOwner(
        DATA_PROVIDER_URL,
        'otherOwner',
        'testpassword',
      );
      await otherOwner.dispose();
      await otherOwner.register();
      const namespace = await testOwner.createNamespace('testnamespace');
      namespaceId = namespace.id;
      ownerKey = testOwner.owner.key;
      ownerKeyOtherOwner = otherOwner.owner.key;
    });

    it('smoke', async () => {
      await smoke(API_NAME, async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}`));
    });
    it('throws 401 with invalid token', async () => {
      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}`,
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}`,
          {
            headers: {
              'Authorization': 'Bearer invalid',
            },
          },
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });
    it('throws 401 with invalid ownerKey', async () => {
      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${ownerKeyOtherOwner}/namespace/${namespaceId}`,
          testOwner.authHeaders(),
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });
    it('namespace does not exist', async () => {
      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/20000000`,
          testOwner.authHeaders(),
        ))
        .throwsError(ERROR_CODE.RESOURCE_NOT_FOUND);
    });
    it('returns a namespace view', async () => {
      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${ownerKey}/namespace/${namespaceId}`,
          testOwner.authHeaders(),
        ))
        .result((result => {
          expect(result).toEqual(    {
            id: namespaceId,
            name: 'testnamespace',
            invitations: [],
            users: [
              {
                id: expect.any(Number),
                name: testOwner.owner.username,
                namespaceId: namespaceId,
                ownerId: testOwner.owner.id,
                avatarId: expect.any(Number),
              },
            ],
            ownerUsers: [
              {
                id: expect.any(Number),
                name: testOwner.owner.username,
                namespaceId: namespaceId,
                ownerId: testOwner.owner.id,
                avatarId: expect.any(Number),
              },
            ],
            records: [],
            avatarId: expect.any(Number),
            hasRecordsToSettle: false,
            settlements: [],
          });
        }));
    });
  });

  describe('settled records', () => {
    const firstDate = moment().set({
      year: 2024,
      month: 2,
      date: 15,
    }).toDate();

    let namespaceId!: number;
    let creatorOwner!: TestOwner;
    let scenario!: TestScenarioNamespace;
    const secondDate = moment(firstDate)
      .subtract(2, 'hours').toDate();
    const thirdDate = moment(firstDate)
      .subtract(1, 'day').toDate();
    const fourthDate = moment(firstDate)
      .subtract(2, 'day').toDate();

    beforeEach(async () => {
      try {
        scenario = await BACKDOOR_ACTIONS.SCENARIO.prepareNamespace(
          testEnv().DATA_PROVIDER_URL,
          testEnv().BACKDOOR_USERNAME,
          testEnv().BACKDOOR_PASSWORD,
          'testnamespace',
          {  username: 'testuser'},
          [
            {  username: 'atestuser1'},
            {  username: 'btestuser2'},
            {  username: 'ctestuser3'},
          ],
          [
            {
              user: 'testuser',
              record: {
                benefitors: [
                  'atestuser1',
                  'btestuser2',
                  'ctestuser3',
                ],
                cost: 4,
                currency: 'SIT',
                paidBy: ['testuser'],
                created: firstDate,
                edited: firstDate,
              },
            },
            {
              user: 'testuser',
              record: {
                benefitors: [
                  'atestuser1',
                  'btestuser2',
                  'ctestuser3',
                ],
                cost: 10,
                currency: 'SIT',
                paidBy: ['testuser'],
                created: secondDate,
                edited: secondDate,
              },
            },
            {
              user: 'testuser',
              record: {
                benefitors: [
                  'atestuser1',
                  'btestuser2',
                  'ctestuser3',
                ],
                cost: 5.4,
                currency: 'SIT',
                paidBy: ['testuser'],
                created: thirdDate,
                edited: thirdDate,
              },
            },
            {
              user: 'testuser',
              record: {
                benefitors: [
                  'atestuser1',
                  'btestuser2',
                  'ctestuser3',
                ],
                cost: 3,
                currency: 'SIT',
                paidBy: ['testuser'],
                created: fourthDate,
                edited: fourthDate,
              },
            },
          ],
        );

        creatorOwner = scenario.creator.owner;
        namespaceId = scenario.namespaceId;
      } catch (error) {
        throwBeforeEachError(error);
      }
    });

    const anyExpect = () => ({
      id: expect.any(Number),
      name: expect.any(String),
      invitations: expect.any(Array),
      users: expect.any(Array),
      ownerUsers: expect.any(Array),
      records: expect.any(Array),
      avatarId: expect.any(Number),
      hasRecordsToSettle: true,
      settlements: [],
    });

    it('verify unsettled view', async () => {

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.owner.key}/namespace/${namespaceId}`,
          creatorOwner.authHeaders(),
        ))
        .result((result => {
          expect(result).toEqual({
            id: namespaceId,
            name: 'testnamespace',
            invitations: [],
            users: scenario.allUsers.map(u => ({
              id: u.user.id,
              name: u.user.name,
              namespaceId: namespaceId,
              ownerId: u.owner.owner.id,
              avatarId: expect.any(Number),
            })),
            ownerUsers: [
              {
                id: expect.any(Number),
                name: creatorOwner.owner.username,
                namespaceId: namespaceId,
                ownerId: creatorOwner.owner.id,
                avatarId: expect.any(Number),
              },
            ],
            records: scenario.addedRecords.map(r => ({
              id: expect.any(Number),
              created: expectDate(r.created),
              createdBy: {
                avatarId: expect.any(Number),
                id: scenario.creator.user.id,
                name: scenario.creator.user.name,
                namespaceId,
                ownerId: scenario.creator.owner.owner.id,
              },
              edited: expectDate(r.edited),
              editedBy: {
                avatarId: expect.any(Number),
                id: scenario.creator.user.id,
                name: scenario.creator.user.name,
                namespaceId,
                ownerId: scenario.creator.owner.owner.id,
              },
              namespace: {
                avatarId: expect.any(Number),
                id: scenario.namespace.id,
                name: scenario.namespace.name,
              },
              data: {
                benefitors: r.data.benefitors.map(b => ({
                  avatarId: expect.any(Number),
                  ownerId: expect.any(Number),
                  id: b,
                  name: expect.any(String),
                  namespaceId: namespaceId,
                })),
                paidBy: r.data.paidBy.map(b => ({
                  avatarId: expect.any(Number),
                  ownerId: expect.any(Number),
                  id: b,
                  name: expect.any(String),
                  namespaceId: namespaceId,
                })),
                cost: r.data.cost,
                currency: r.data.currency,
              },
              settledOn: null,
              settlementId: null,
            })),
            avatarId: expect.any(Number),
            hasRecordsToSettle: true,
            settlements: [],
          });
        }));
    });

    it('is settled', async () => {

      try {
        await creatorOwner.settleRecords(namespaceId, scenario.creator.user.id, scenario.addedRecords.map(r => r.id), firstDate);
      } catch (error) {
        throwBeforeEachError(error);
      }

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.owner.key}/namespace/${namespaceId}`,
          creatorOwner.authHeaders(),
        ))
        .result((result => {
          const expected = anyExpect();
          expected.settlements = [
            {
              'isAllSettled': false,
              'settleRecords': expect.any(Array),
              'settledBy': {
                'avatarId': expect.any(Number),
                'id': scenario.creator.user.id,
                'name': scenario.creator.user.name,
                'namespaceId': namespaceId,
                'ownerId': scenario.creator.owner.owner.id,
              },
              'settlement': {
                'created': expect.any(String),
                'createdBy': scenario.creator.user.id,
                'edited': expect.any(String),
                'editedBy': scenario.creator.user.id,
                'id': expect.any(Number),
                'namespaceId': namespaceId,
              },
            },
          ];
          expected.hasRecordsToSettle = false;
          expect(result).toEqual(expected);
          expect(result.settlements).toHaveLength(1);
          expect(result.settlements[0].settleRecords).toHaveLength(3);
        }));
    });

  });
});
