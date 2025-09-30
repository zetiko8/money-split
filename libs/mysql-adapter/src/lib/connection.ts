import { ERROR_CODE } from '@angular-monorepo/entities';
import { Connection } from 'mysql2';
import { Logger } from '@angular-monorepo/utils';

export class MY_SQL_LOW_LEVEL {
  constructor(
    private readonly connection: Connection,
    private readonly logger: Logger,
  ) {}

  query<T>(
    sql: string,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.connection.query(
        sql,
        (err, rows) => {
          if (err) return reject(err);
          else return resolve(rows as unknown as T);
        },
      );
    });
  }

  async lastInsertId(): Promise<number> {
    const d = await this.query<{
      'LAST_INSERT_ID()': number
    }[]>('SELECT LAST_INSERT_ID()');

    return d[0]['LAST_INSERT_ID()'];
  }

  async queryMultiple<T>(
    sqlCreator: (d: unknown) => string,
    data: unknown[],
  ): Promise<T[]> {
    const result: T[] = [];
    for (let i = 0; i < data.length; i++) {
      const response = await this.query<T>(sqlCreator(data[i]));
      result.push(response);
    }

    return result;
  }

  async jsonProcedure<T>(
    connection: Connection,
    sql: string,
  ) {
    let result: unknown[];

    try {
      result = await this.query<unknown[]>(sql);
      if (!result) throw Error(ERROR_CODE.PROCEDURE_ERROR);
      if (!result[0]) throw Error(ERROR_CODE.PROCEDURE_ERROR);
      if (!result[0][0]) throw Error(ERROR_CODE.PROCEDURE_ERROR);
      if (result[0][0].procedureError) {
        const procedureError = JSON
          .parse(result[0][0].procedureError)
          .procedureError;
        throw Error(procedureError);
      }
      if (!result[1]) throw Error(ERROR_CODE.PROCEDURE_ERROR);
      if (!result[1][0]) throw Error(ERROR_CODE.PROCEDURE_ERROR);
      if (!result[1][0].jsonResult) throw Error(ERROR_CODE.PROCEDURE_ERROR);
      try {
        return JSON.parse(result[1][0].jsonResult) as T;
      } catch (error) {
        throw Error(ERROR_CODE.PROCEDURE_ERROR);
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
