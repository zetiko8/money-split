import axios from 'axios';
import { DATA_PROVIDER_URL, fnCall, queryDb, smoke, testEnv, throwBeforeEachError } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { settleConfirmApi } from '@angular-monorepo/api-interface';
import { BACKDOOR_ACTIONS, TestOwner, TestScenarioNamespace } from '@angular-monorepo/backdoor';
import moment from 'moment';

const api = settleConfirmApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {

  describe('basics', () => {
    let namespaceId!: number;
    let creatorOwner!: TestOwner;
    let scenario!: TestScenarioNamespace;
    let ownerKeyOtherOwner!: string;

    beforeEach(async () => {
      try {
        scenario = await BACKDOOR_ACTIONS.SCENARIO.scenarios[1](
          moment,
          testEnv().DATA_PROVIDER_URL,
          testEnv().BACKDOOR_USERNAME,
          testEnv().BACKDOOR_PASSWORD,
        );

        creatorOwner = scenario.creator.owner;
        namespaceId = scenario.namespaceId;
        ownerKeyOtherOwner = (scenario.allUsers.find(u => u.owner.owner.id !== creatorOwner.owner.id)).owner.owner.key;
      } catch (error) {
        throwBeforeEachError(error);
      }
    });

    it('smoke', async () => {
      await smoke(API_NAME, async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/${creatorOwner.owner.key}/namespace/${namespaceId}/settle/confirm/${scenario.creator.user.id}`,
        {}));
    });
    it('throws 401 with invalid token', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.owner.key}/namespace/${namespaceId}/settle/confirm/${scenario.creator.user.id}`,
          {},
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.owner.key}/namespace/${namespaceId}/settle/confirm/${scenario.creator.user.id}`,
          {},
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
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${ownerKeyOtherOwner}/namespace/${namespaceId}/settle/confirm/${scenario.creator.user.id}`,
          {},
          creatorOwner.authHeaders(),
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
    });
    it.todo('throws 401 with namespace that does not belong to user');
    it.todo('throws 401 with user that does not belong to owner');
    it.todo('throws 401 with record that does not belong to namespace');
    it.todo('record doees not exist');
    it.todo('namespace does not exist',
      // async () => {
      //   await fnCall(API_NAME,
      //     async () => await axios.post(
      //       `${DATA_PROVIDER_URL}/app/${creatorOwner.owner.key}/namespace/${20000000}/settle/confirm/${scenario.creator.user.id}`,
      //       {
      //         records: scenario.addedRecords.map(r => r.id),
      //       },
      //       creatorOwner.authHeaders(),
      //     ))
      //     .throwsError(ERROR_CODE.RESOURCE_NOT_FOUND);
      // }
    );
    it('returns settlement object', async () => {
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.owner.key}/namespace/${namespaceId}/settle/confirm/${scenario.creator.user.id}`,
          {
            records: scenario.addedRecords.map(r => r.id),
          },
          creatorOwner.authHeaders()))
        .result((result => {
          expect(result).toEqual({
            id: expect.any(Number),
            created: expect.any(String),
            edited: expect.any(String),
            createdBy: scenario.creator.user.id,
            editedBy: scenario.creator.user.id,
            namespaceId: namespaceId,
          });
        }));
    });
  });

  describe('dbState', () => {
    let settlementId!: number;
    let namespaceId!: number;
    let creatorOwner!: TestOwner;
    let scenario!: TestScenarioNamespace;

    beforeEach(async () => {
      try {
        scenario = await BACKDOOR_ACTIONS.SCENARIO.scenarios[1](
          moment,
          testEnv().DATA_PROVIDER_URL,
          testEnv().BACKDOOR_USERNAME,
          testEnv().BACKDOOR_PASSWORD,
        );

        creatorOwner = scenario.creator.owner;
        namespaceId = scenario.namespaceId;
      } catch (error) {
        throwBeforeEachError(error);
      }

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/${creatorOwner.owner.key}/namespace/${namespaceId}/settle/confirm/${scenario.creator.user.id}`,
          {
            records: scenario.addedRecords.map(r => r.id),
          },
          creatorOwner.authHeaders()))
        .result((result => {
          settlementId = result.id;
        }));
    });

    it('saves SettlementDebts into db', async () => {
      const response = await queryDb(
        `
        SELECT * FROM \`SettlementDebt\`
        WHERE settlementId = ${settlementId}
        `,
      );
      (response as { data: string }[]).forEach(item => {
        expect(item).toEqual({
          id: expect.any(Number),
          created: expect.any(String),
          edited: expect.any(String),
          createdBy: scenario.creator.user.id,
          editedBy: scenario.creator.user.id,
          data: expect.any(String),
          namespaceId: namespaceId,
          settlementId: settlementId,
          settled: 0,
          settledOn: null,
          settledBy: null,
        });
        expect(JSON.parse(item.data)).toEqual({
          'benefitors': [expect.any(Number)],
          'cost': expect.any(Number),
          'currency':'SIT',
          'paidBy':[scenario.creator.user.id],
        });
        expect(JSON.parse(item.data).cost)
          .toBeCloseTo(7.47);
      });
      expect(response).toHaveLength(3);
    });
  });
});
