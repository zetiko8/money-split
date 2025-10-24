import axios from 'axios';
import { BACKDOOR_PASSWORD, BACKDOOR_USERNAME, DATA_MOCKER_URL, DATA_PROVIDER_URL, fnCall, smoke, testWrap } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { getInvitationViewApi } from '@angular-monorepo/api-interface';
import { MockDataMachine2 } from '@angular-monorepo/backdoor';

const api = getInvitationViewApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {

  describe('smoke', () => {
    testWrap('', 'smoke', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator' },
            { name: 'test@email.com' },
          ],
          namespaces: [
            {
              name: 'testnamespace',
              creator: 'creator',
              users: [],
              paymentEvents: [],
              invitations: [
                {
                  email: 'test@email.com',
                  invitor: 'creator',
                },
              ],
            },
          ],
        },
      );

      const invitation = mockDataMachine.getNamespaceInvitation('testnamespace', 'test@email.com');

      await smoke(API_NAME, async () => await axios.get(
        `${DATA_PROVIDER_URL}/app/invitation/${invitation.invitationKey}`,
      ));
    });
  });

  describe('validation', () => {
    testWrap('', 'not found invitation key', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator' },
            { name: 'test@email.com' },
          ],
          namespaces: [
            {
              name: 'testnamespace',
              creator: 'creator',
              users: [],
              paymentEvents: [],
              invitations: [
                {
                  email: 'test@email.com',
                  invitor: 'creator',
                },
              ],
            },
          ],
        },
      );

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/invitation/${'not-found'}`,
          await mockDataMachine.getAuthHeaders('test@email.com'),
        ))
        .throwsError(ERROR_CODE.RESOURCE_NOT_FOUND);
    });

    testWrap('', 'throws 401 with invalid token', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator' },
            { name: 'test@email.com' },
          ],
          namespaces: [
            {
              name: 'testnamespace',
              creator: 'creator',
              users: [],
              paymentEvents: [],
              invitations: [
                {
                  email: 'test@email.com',
                  invitor: 'creator',
                },
              ],
            },
          ],
        },
      );

      const invitation = mockDataMachine.getNamespaceInvitation('testnamespace', 'test@email.com');

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
    testWrap('', 'allow unauthenticated access', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator' },
            { name: 'test@email.com' },
          ],
          namespaces: [
            {
              name: 'testnamespace',
              creator: 'creator',
              users: [],
              paymentEvents: [],
              invitations: [
                {
                  email: 'test@email.com',
                  invitor: 'creator',
                },
              ],
            },
          ],
        },
      );

      const invitation = mockDataMachine.getNamespaceInvitation('testnamespace', 'test@email.com');

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/invitation/${invitation.invitationKey}`,
        ))
        .throwsNoError();
    });

    testWrap('', 'returns an invitationView', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_MOCKER_URL,
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        {
          owners: [
            { name: 'creator' },
            { name: 'test@email.com' },
          ],
          namespaces: [
            {
              name: 'testnamespace',
              creator: 'creator',
              users: [],
              paymentEvents: [],
              invitations: [
                {
                  email: 'test@email.com',
                  invitor: 'creator',
                },
              ],
            },
          ],
        },
      );

      const creator = mockDataMachine.getOwner('creator');
      const namespace = mockDataMachine.getNamespace('testnamespace');
      const invitation = mockDataMachine.getNamespaceInvitation('testnamespace', 'test@email.com');

      await fnCall(API_NAME,
        async () => await axios.get(
          `${DATA_PROVIDER_URL}/app/invitation/${invitation.invitationKey}`,
          await mockDataMachine.getAuthHeaders('test@email.com')),
      )
        .result((result => {
          expect(result).toEqual({
            accepted: false,
            rejected: false,
            id: expect.any(Number),
            email: 'test@email.com',
            created: expect.any(String),
            edited: expect.any(String),
            createdBy: creator.id,
            editedBy: creator.id,
            invitationKey: invitation.invitationKey,
            namespace: {
              id: namespace.id,
              name: 'testnamespace',
              avatarId: expect.any(Number),
            },
          });
        }));
    });
  });
});
