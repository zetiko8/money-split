import { createConnection } from 'mysql2';

export const connection
    = createConnection({
      host: 'localhost',
      user: 'root',
      password: 'anze123',
      database: 'main',
      port: 13307,
    });

connection.connect();

export async function query<T>(
  sql: string,
): Promise<T> {
  console.log(sql);
  return new Promise((resolve, reject) => {
    connection.query(
      sql,
      (err, rows) => {
        if (err) return reject(err);
        else return resolve(rows as unknown as T);
      },
    );
  });
}

export async function lastInsertId(): Promise<number> {
  const d = await query<{
    'LAST_INSERT_ID()': number
  }[]>('SELECT LAST_INSERT_ID()');
  
  return d[0]['LAST_INSERT_ID()'];
}

export async function queryMultiple<T>(
  sqlCreator: (d: unknown) => string,
  data: unknown[],
): Promise<T[]> {
  const result: T[] = [];
  for (let i = 0; i < data.length; i++) {
    const response = await query<T>(sqlCreator(data[i]));
    result.push(response);
  }

  return result;
}