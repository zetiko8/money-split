import { BACKDOOR_ACTIONS } from './test-helpers/backdoor-actions';

export class NamespaceTestResource {

  ownerKey!: string;
  namespaceId!: number;

  async setup (
    ownerKey: string,
  ) {
    try {
      const namespace = await BACKDOOR_ACTIONS.createNamespace(
        this.DATA_PROVIDER_URL,
        this.name,
        ownerKey,
      );

      this.ownerKey = ownerKey;
      this.namespaceId = namespace.id;
    } catch (error) {
      throw Error('NamespaceTestResource setup error - '
        + (error as Error).message);
    }
  }

  async dispose () {
    try {
      await BACKDOOR_ACTIONS.deleteNamespaceByName(
        this.DATA_PROVIDER_URL, this.name);
    } catch (error) {
      throw Error('NamespaceTestResource dispose error - '
        + (error as Error).message);
    }
  }

  constructor (
    private readonly DATA_PROVIDER_URL: string,
    private readonly name: string,
  ) {}
}

export * from './test-helpers/test-owner';
export * from './test-helpers/backdoor-actions';