import { mysqlAdapter } from './mysql-adapter';

describe('mysqlAdapter', () => {
  it('should work', () => {
    expect(mysqlAdapter()).toEqual('mysql-adapter');
  });
});
