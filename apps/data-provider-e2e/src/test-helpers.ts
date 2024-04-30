import { BACKDOOR_ACTIONS } from '@angular-monorepo/backdoor';
import { AxiosError, AxiosResponse } from 'axios';
import axios from 'axios';

export const DATA_PROVIDER_URL = 'http://localhost:3333/data-provider';

export async function smoke (
  apiName: string,
  apiCall: () => Promise<AxiosResponse>,
) {
  try {
    await apiCall();
  } catch (error) {
    const err = error as AxiosError;
    if (err.message === 'Request failed with status code 404')
      throw Error(`${apiName} 404`);

    if (err.response?.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(err.response.data as any).error)
        throw Error(`${apiName} failed`);
    }
  }
}

export function fnCall (
  apiName: string,
  apiCall: () => Promise<AxiosResponse>,
) {
  return {
    async throwsError (error: string) {
      let errorCode: string | null = null;

      try {
        await apiCall();
      } catch (error) {
        const err = error as AxiosError;
        if (err.message === 'Request failed with status code 404')
          throw Error(`${apiName} 404`);

        if (err.response?.data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((err.response.data as any).error)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            errorCode = (err.response.data as any).error as string;
        }
      }

      if (errorCode === null)
        throw Error('Expected error to have been thrown');

      expect(errorCode).toBe(error);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async result (callback: (result: any) => void) {
      try {
        const res = await apiCall();
        callback(res.data);
      } catch (error) {
        const err = error as AxiosError;
        if (err.message === 'Request failed with status code 404')
          throw Error(`${apiName} 404`);

        if (err.response?.status === 500)
          throw Error(`${apiName} 500 - ${err.response?.statusText}`);

        if (err.response?.data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((err.response.data as any).error)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            throw Error((err.response.data as any).error as string);
        }

        throw error;
      }
    },
  };
}
export function expectEqual (
  expected: unknown,
  actual: unknown,
) {
  Object.keys(expected).forEach((key) => {
    if (expected[key] === '_ignore_') {
      expect(actual).toHaveProperty(key);
    }
    else if (expected[key] === '_type_number_') {
      expect(actual).toHaveProperty(key);
      expect(typeof actual[key]).toEqual('number');
    }
    else {
      try {
        expect(actual[key]).toEqual(expected[key]);
      } catch (error) {
        console.log(key);
        throw error;
      }
    }
  });
}

export async function queryDb (sql: string) {
  try {
    const response = await BACKDOOR_ACTIONS.query(
      DATA_PROVIDER_URL,
      sql,
    );
    return response;
  } catch (error) {
    throw Error('queryDb error - ' + error.message);
  }
}

export const MOCK_FNS = {
  deleteOwner: async (
    ownerName: string,
  ) => {
    await BACKDOOR_ACTIONS.deleteOwner(
      DATA_PROVIDER_URL,
      ownerName,
    );
  },
  registerOwner: async (
    ownerName: string,
    ownerPassword: string,
  ) => {
    const owner = await BACKDOOR_ACTIONS.registerOwner(
      DATA_PROVIDER_URL,
      ownerName,
      ownerPassword,
    );

    return {
      ownerKey: owner.key,
      ownerId: owner.id,
      ownerUsername: owner.username,
      ownerAvatarId: owner.avatarId,
    };
  },
  createNamespace: async (
    ownerKey: string,
    namespaceName: string,
  ) => {
    const mNamespace = await BACKDOOR_ACTIONS.createNamespace(
      DATA_PROVIDER_URL,
      namespaceName,
      ownerKey,
    );

    return mNamespace;
  },
  login: async (
    ownerUsername: string,
    ownerPassword: string,
  ) => {
    const response = await axios.post(
      `${DATA_PROVIDER_URL}/app/login`,
      {
        username: ownerUsername,
        password: ownerPassword,
      },
    );

    return response.data.token;
  },
};

export class TestContext {
  ownerKey: string;
  ownerId: number;
  ownerUsername: string;
  ownerPassword: string;
  ownerAvatarId: number;
  token: string;
  namespaces: {
    namespaceId: number,
    namespaceName: string,
    invitations: {
      invitationKey: string,
      ownerTestContext: TestContext,
    }[]
  }[] = [];

  async deleteOwner(ownerUsername?: string) {
    await MOCK_FNS.deleteOwner(
      ownerUsername || this.ownerUsername);
  }

  async registerOwner (
    ownerName: string,
    ownerPassword: string,
  ) {
    const owner = await MOCK_FNS.registerOwner(
      ownerName, ownerPassword);

    this.ownerKey = owner.ownerKey;
    this.ownerId = owner.ownerId;
    this.ownerUsername = owner.ownerUsername;
    this.ownerAvatarId = owner.ownerAvatarId;
    this.ownerPassword = ownerPassword;

    return this;
  }

  async createNamespace(namespaceName: string) {
    const mNamespace = await MOCK_FNS.createNamespace(
      this.ownerKey, namespaceName,
    );

    this.namespaces.push({
      namespaceId: mNamespace.id,
      namespaceName: mNamespace.name,
      invitations: [],
    });

    return this;
  }

  async login () {
    const token = await MOCK_FNS.login(
      this.ownerUsername, this.ownerPassword);

    this.token = token;

    return this;
  }

  async deleteNamespaces () {
    for (const namespace of this.namespaces) {
      await BACKDOOR_ACTIONS.deleteNamespaceByName(
        DATA_PROVIDER_URL,
        namespace.namespaceName,
      );

      await BACKDOOR_ACTIONS.deleteNamespaceInvitations(
        DATA_PROVIDER_URL,
        namespace.namespaceId,
      );
    }
  }

  async inviteOwnerToNamespace (
    namespaceIndex: number,
    email: string,
  ) {
    await this.login();
    const namespace = this.namespaces[namespaceIndex];
    const invitation = await BACKDOOR_ACTIONS.invite(
      DATA_PROVIDER_URL,
      this.token,
      this.ownerKey,
      namespace.namespaceId,
      email,
    );

    namespace.invitations.push({
      invitationKey: invitation.invitationKey,
      ownerTestContext: new TestContext(),
    });
  }

  authHeaders () {
    return {
      headers: {
        'Authorization': 'Bearer ' + this.token,
      },
    };
  }
}
