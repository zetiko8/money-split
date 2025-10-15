import { Logger } from '@angular-monorepo/utils';
import { createPool, PoolConnection } from 'mysql2';

const pool = createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'anze123',
  database: process.env.MYSQL_DATABASE || 'main',
  port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 13308,
  connectionLimit: 10,
});

pool.getConnection((err, connection) => {
  if (err) throw err;
  connection.release();
});

export class Transaction implements Transaction {
  constructor(
    private readonly connection: PoolConnection,
    private readonly logger: Logger,
    private readonly autoRollbackOnError: boolean,
  ) {

  }

  commit () {
    return new Promise<void>((resolve, reject) => {
      this.connection.commit((err) => {
        if (err) return reject(err);
        this.connection.release();
        resolve(null);
      });
    });
  }

  rollback () {
    return new Promise<void>((resolve, reject) => {
      this.connection.rollback((err) => {
        if (err) {
          this.logger.error('Rollback error', err);
          this.connection.release();
          return reject(err);
        };
        this.connection.release();
        resolve(null);
      });
    });
  }

  query<T> (sql: string, values?: unknown[]) {
    return new Promise<T>((resolve, reject) => {
      return this.connection.query(sql, values, (err, results) => {
        if (err) {
          if (this.autoRollbackOnError) {
            this.rollback()
              .then(() => {
                reject(err);
              })
              .catch((error) => {
                this.logger.error('Rollback error', error);
                this.logger.error('Original error', err);
                reject(error);
              });
          } else {
            reject(err);
          }
        } else {
          return resolve(results as T);
        }
      });
    });
  }

  async jsonProcedure<T>(
    sql: string,
    params?: unknown[],
  ) {
    let result: unknown[];

    try {
      result = await this.query<unknown[]>(sql, params);
      if (!result) throw Error('Procedure error');
      if (!result[0]) throw Error('Procedure error');
      if (!result[0][0]) throw Error('Procedure error');
      if (result[0][0].procedureError) {
        const procedureError = JSON
          .parse(result[0][0].procedureError)
          .procedureError;
        throw Error(procedureError);
      }
      if (!result[1]) throw Error('Procedure error');
      if (!result[1][0]) throw Error('Procedure error');
      if (!result[1][0].jsonResult) throw Error('Procedure error');
      try {
        return JSON.parse(result[1][0].jsonResult) as T;
      } catch (error) {
        throw Error('Procedure error');
      }
    } catch (error) {
      if (error.message && error.message.startsWith(
        'You have an error in your SQL syntax',
      )) {
        this.logger.error('SQL', error);
      }
      this.logger.error('SQL', error);
      this.logger.log('Result', result);
      throw error;
    }
  }
}

function getPoolConnection(): Promise<PoolConnection> {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) return reject(err);
      resolve(connection);
    });
  });
}

/**
 * @deprecated Use getTransactionContext instead
 */
export async function getTransaction(
  logger: Logger,
  autoRollbackOnError = true,
): Promise<Transaction> {
  const connection: PoolConnection = await getPoolConnection();
  return new Transaction(connection, logger, autoRollbackOnError);
}

export async function getTransactionContext<T>(
  options: {
    logger: Logger,
    autoRollbackOnError?: boolean,
  },
  callback: (transaction: Transaction) => Promise<T>,
): Promise<T> {
  if (options.autoRollbackOnError === undefined) options.autoRollbackOnError = true;

  const transaction = await getTransaction(options.logger, options.autoRollbackOnError);
  try {
    const result = await callback(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}


