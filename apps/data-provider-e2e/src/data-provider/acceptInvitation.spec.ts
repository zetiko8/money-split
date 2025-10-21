import axios from 'axios';
import { BACKDOOR_PASSWORD, BACKDOOR_USERNAME, DATA_PROVIDER_URL, fnCall, queryDb, smoke, testWrap } from '../test-helpers';
import { ERROR_CODE } from '@angular-monorepo/entities';
import { acceptInvitationApi } from '@angular-monorepo/api-interface';
import { MockDataMachine2 } from '@angular-monorepo/backdoor';

const api = acceptInvitationApi();
const API_NAME = api.ajax.method
  + ':' + api.ajax.endpoint;

describe(API_NAME, () => {

  describe('smoke', () => {
    testWrap('', 'smoke', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              invitations: [
                { email: 'test@email.com', invitor: 'creator' },
              ],
              users: [

              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const invitation = mockDataMachine.getNamespaceInvitation('testnamespace', 'test@email.com');


      await smoke(API_NAME, async () => await axios.post(
        `${DATA_PROVIDER_URL}/app/invitation/${invitation.invitationKey}/accept`,
      ));
    });
  });

  describe('validation', () => {
    testWrap('', 'requires name to be provided', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              invitations: [
                { email: 'test@email.com', invitor: 'creator' },
              ],
              users: [

              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const invitation = mockDataMachine.getNamespaceInvitation('testnamespace', 'test@email.com');


      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/invitation/${invitation.invitationKey}/accept`,
          {},
          await mockDataMachine.getAuthHeaders('test@email.com')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });
    testWrap('', 'requires name to be a string', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              invitations: [
                { email: 'test@email.com', invitor: 'creator' },
              ],
              users: [

              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const invitation = mockDataMachine.getNamespaceInvitation('testnamespace', 'test@email.com');


      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/invitation/${invitation.invitationKey}/accept`,
          { name: 3 },
          await mockDataMachine.getAuthHeaders('test@email.com')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });
    testWrap('', 'not found invitation key', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
            },
          ],
        },
      );

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/invitation/${'not-found'}/accept`,
          { name: 'invitedowner' },
          await mockDataMachine.getAuthHeaders('test@email.com')))
        .throwsError(ERROR_CODE.RESOURCE_NOT_FOUND);
    });
    testWrap('', 'throws 401 with invalid token', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              invitations: [
                { email: 'test@email.com', invitor: 'creator' },
              ],
              users: [

              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const invitation = mockDataMachine.getNamespaceInvitation('testnamespace', 'test@email.com');


      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/invitation/${invitation.invitationKey}/accept`,
          { name: 'invitedowner' },
        ))
        .throwsError(ERROR_CODE.UNAUTHORIZED);
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/invitation/${invitation.invitationKey}/accept`,
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

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              invitations: [
                { email: 'test@email.com', invitor: 'creator' },
              ],
              users: [

              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const namespace = mockDataMachine.getNamespace('testnamespace');
      const invitation = mockDataMachine.getNamespaceInvitation('testnamespace', 'test@email.com');

      const creatorOwner = mockDataMachine.getOwner('creator');
      const testOwner = mockDataMachine.getOwner('test@email.com');

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/invitation/${invitation.invitationKey}/accept`,
          { name: 'invitedowner' },
          await mockDataMachine.getAuthHeaders('test@email.com')))
        .result((result => {
          expect(result).toEqual({
            namespaceId: namespace.id,
            accepted: true,
            rejected: false,
            id: expect.any(Number),
            email: 'test@email.com',
            created: expect.any(String),
            edited: expect.any(String),
            createdBy: creatorOwner.id,
            editedBy: testOwner.id,
            invitationKey: invitation.invitationKey,
          });
        }));
    });
    testWrap('', 'trims the name and does not allow empty after trimming', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              invitations: [
                { email: 'test@email.com', invitor: 'creator' },
              ],
              users: [

              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const namespace = mockDataMachine.getNamespace('testnamespace');
      const invitation = mockDataMachine.getNamespaceInvitation('testnamespace', 'test@email.com');

      const testOwner = mockDataMachine.getOwner('test@email.com');

      // Should save trimmed name
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/invitation/${invitation.invitationKey}/accept`,
          { name: '   inviteduser   ' },
          await mockDataMachine.getAuthHeaders('test@email.com')))
        .result(() => {});

      // Check by querying the DB
      const userRes = await queryDb(
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        `SELECT * FROM \`User\` 
                WHERE namespaceId = ${namespace.id} 
                AND ownerId = ${testOwner.id}`,
      );
      expect(userRes[0].name).toBe('inviteduser');

      // Should not allow name with only spaces
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/invitation/${invitation.invitationKey}/accept`,
          { name: '   ' },
          await mockDataMachine.getAuthHeaders('test@email.com')))
        .throwsError(ERROR_CODE.INVALID_REQUEST);
    });
    it.todo('the owner accepting is the same as the inviter');

  });

  describe('dbState', () => {
    testWrap('', 'saves invitation in the db', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              invitations: [
                { email: 'test@email.com', invitor: 'creator' },
              ],
              users: [

              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const namespace = mockDataMachine.getNamespace('testnamespace');
      const invitation = mockDataMachine.getNamespaceInvitation('testnamespace', 'test@email.com');

      const creatorOwner = mockDataMachine.getOwner('creator');
      const testOwner = mockDataMachine.getOwner('test@email.com');

      let invitationId!: number;
      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/invitation/${invitation.invitationKey}/accept`,
          { name: 'inviteduser' },
          await mockDataMachine.getAuthHeaders('test@email.com')))
        .result((async res => {
          invitationId = res.id;
        }));

      const response = await queryDb(
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        `
        SELECT * FROM Invitation
        WHERE id = ${invitationId}
        `,
      );
      expect(response[0]).toEqual({
        namespaceId: namespace.id,
        accepted: 1,
        rejected: 0,
        id: expect.any(Number),
        email: 'test@email.com',
        created: expect.any(String),
        edited: expect.any(String),
        createdBy: creatorOwner.id,
        editedBy: testOwner.id,
        invitationKey: expect.any(String),
      });
      expect(response).toHaveLength(1);
    });
    testWrap('', 'adds owner to the namespace', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              invitations: [
                { email: 'test@email.com', invitor: 'creator' },
              ],
              users: [

              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const namespace = mockDataMachine.getNamespace('testnamespace');
      const invitation = mockDataMachine.getNamespaceInvitation('testnamespace', 'test@email.com');

      const testOwner = mockDataMachine.getOwner('test@email.com');

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/invitation/${invitation.invitationKey}/accept`,
          { name: 'inviteduser' },
          await mockDataMachine.getAuthHeaders('test@email.com')))
        .result(() => {});

      const response = await queryDb(
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        `
        SELECT * FROM NamespaceOwner
        WHERE namespaceId = ${namespace.id}
        AND ownerId = ${testOwner.id}
        `,
      );
      expect(response[0]).toEqual({
        namespaceId: namespace.id,
        ownerId: testOwner.id,
      });
      expect(response).toHaveLength(1);
    });
    testWrap('', 'adds user to the namespace', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              invitations: [
                { email: 'test@email.com', invitor: 'creator' },
              ],
              users: [

              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const namespace = mockDataMachine.getNamespace('testnamespace');
      const invitation = mockDataMachine.getNamespaceInvitation('testnamespace', 'test@email.com');

      const testOwner = mockDataMachine.getOwner('test@email.com');

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/invitation/${invitation.invitationKey}/accept`,
          { name: 'inviteduser' },
          await mockDataMachine.getAuthHeaders('test@email.com')))
        .result(() => {});

      const response = await queryDb(
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        `
        SELECT * FROM \`User\`
        WHERE namespaceId = ${namespace.id}
        AND ownerId = ${testOwner.id}
        `,
      );
      expect(response[0]).toEqual({
        namespaceId: namespace.id,
        ownerId: testOwner.id,
        avatarId: expect.any(Number),
        id: expect.any(Number),
        name: 'inviteduser',
      });
      expect(response).toHaveLength(1);
    });
    testWrap('', 'edited date is corrected', async () => {

      const mockDataMachine = await MockDataMachine2.createScenario(
        DATA_PROVIDER_URL,
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
              invitations: [
                { email: 'test@email.com', invitor: 'creator' },
              ],
              users: [

              ],
              paymentEvents: [],
            },
          ],
        },
      );

      const invitation = mockDataMachine.getNamespaceInvitation('testnamespace', 'test@email.com');

      const createdDate = new Date(invitation.created);
      const editedDateBefore = new Date(invitation.edited);

      // Wait a bit to ensure time difference
      await new Promise(resolve => setTimeout(resolve, 500));

      await fnCall(API_NAME,
        async () => await axios.post(
          `${DATA_PROVIDER_URL}/app/invitation/${invitation.invitationKey}/accept`,
          { name: 'inviteduser' },
          await mockDataMachine.getAuthHeaders('test@email.com')))
        .result(() => {});

      // Query the database to check the edited date
      const response = await queryDb(
        BACKDOOR_USERNAME,
        BACKDOOR_PASSWORD,
        `
        SELECT * FROM Invitation
        WHERE id = ${invitation.id}
        `,
      );

      const editedDateAfter = new Date(response[0].edited);

      // Created date should remain unchanged
      expect(new Date(response[0].created).getTime()).toBe(createdDate.getTime());

      // Edited date should be updated (greater than before)
      expect(editedDateAfter.getTime()).toBeGreaterThan(editedDateBefore.getTime());
    });
  });
});
