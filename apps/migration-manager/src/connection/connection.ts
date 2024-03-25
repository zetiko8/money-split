import { createConnection } from 'mysql2';

const connObject = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'anze123',
  database: process.env.MYSQL_DATABASE || 'main',
  port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 13308,
};

export const connection
    = createConnection(connObject);

connection.connect();

export async function query<T>(
  sql: string,
): Promise<T> {
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

// export async function query<T>(
//   sql: string,
// ): Promise<T> {
//   return new Promise((resolve, reject) => {
//     let connection: Connection | null = null;
//     try {
//       connection
//         = createConnection(connObject);
      
//       connection.connect(err => {
//         if (err) {
//           console.log(err);
//           reject(err);
//           try {
//             connection.end();
//             connection.destroy();
//           } catch (error) {
//             //
//           }
//         }
//         else connection.query(
//           sql,
//           (err, rows) => {
//             if (err) {
//               try {                
//                 connection.end();
//                 connection.destroy();
//               } catch (error) {
//                 //
//               }
//               return reject(err);
//             }
//             else {
//               try {
//                 connection.end();
//                 connection.destroy();
//               } catch (error) {
//                 //
//               }
//               return resolve(rows as unknown as T);
//             }
//           },
//         );
//       });
      
//     } catch (error) {
//       if (connection) {
//         try {
//           connection.end();
//           connection.destroy();          
//         } catch (error) {
//           //
//         }
//       } 
//       reject(error);
//     }

//   });
// }

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