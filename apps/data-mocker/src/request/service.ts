import { RequestHandler } from 'express';

export async function logRequest (
  endpoint: string,
  method: string,
  payload: unknown,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const json = JSON.stringify(payload);
  // eslint-disable-next-line no-console
  console.log(endpoint, method);
  // console.log(endpoint, method, payload);

  // const sql =             `
  //       INSERT INTO Request
  //       (\`method\`, payload)
  //       VALUES('${method}', '${json}');
  //       `;

  // await query(sql);
}

export const logRequestMiddleware = (
  method = '',
) => {
  const mw: RequestHandler = async (
    req, res, next,
  ) => {
    try {
      await logRequest(req.url, method, req.body);

      next();
    } catch (error) {
      next(error);
    }
  };

  return mw;
};

