import express, { Request } from 'express';
import * as path from 'path';
import * as cors from 'cors';
import fs from 'fs';
import { query } from './connection/connection';
import { ERROR_CODE, Owner } from '@angular-monorepo/entities';
import axios from 'axios';
import { DATA_PROVIDER_API } from '@angular-monorepo/api-interface';

const app = express();

app.use(cors.default());
app.use(express.json({ limit: '50mb' }));

app.get('/migration-manager/api', (req, res) => {
  res.json({ message: 'Welcome to migration-manager!' });
});

app.get('/migration-manager/api/migration', async (req, res) => {
  try {
    const result = await getAllMigrations();
    res.json(result);
  } catch (error) {
    res.json({
      error: error.message,
      details: error.details,
    });
  }
});

app.get('/migration-manager/api/procedures', async (req, res) => {
  try {
    const result = await getAllProcedures();
    res.json(result);
  } catch (error) {
    res.json({
      error: error.message,
      details: error.details,
    });
  }
});

app.get('/migration-manager/api/migration/up/:id', async (req, res) => {
  try {
    authorize(req);

    await runMigration(
      req.params['id'],
      true,
    );
    res.json({
      id: req.params['id'],
      up: true,
    });
  } catch (error) {
    res.json({
      id: req.params['id'],
      up: true,
      error: error.message,
      details: error.details,
    });
  }
});

app.get('/migration-manager/api/migration/down/:id', async (req, res) => {
  try {
    authorize(req);

    await runMigration(
      req.params['id'],
      false,
    );
    res.json({
      id: req.params['id'],
      up: false,
    });
  } catch (error) {
    res.json({
      id: req.params['id'],
      up: false,
      error: error.message,
      details: error.details,
    });
  }
});

app.get('/migration-manager/api/procedure/up/:id', async (req, res) => {
  try {
    authorize(req);

    await runProcedure(
      req.params['id'],
      true,
    );
    res.json({
      id: req.params['id'],
      up: true,
    });
  } catch (error) {
    res.json({
      id: req.params['id'],
      up: true,
      error: error.message,
      details: error.details,
    });
  }
});

app.get('/migration-manager/api/migration/all/up', async (req, res) => {
  try {
    authorize(req);

    const migrations = (await getAllMigrations()).migrations;

    for (const migration of migrations) {
      await runMigration(
        migration.id,
        true,
      );
    }

    res.json({
      id: 'all/up',
      up: true,
    });
  } catch (error) {
    res.json({
      id: 'all/up',
      up: true,
      error: error.message,
      details: error.details,
    });
  }
});

app.get('/migration-manager/api/migration/all/unstaged/up', async (req, res) => {
  try {
    authorize(req);

    const migrations = (await getAllMigrations()).migrations;

    for (const migration of migrations) {
      if (!migration.isApplied)
        await runMigration(
          migration.id,
          true,
        );
    }

    res.json({
      id: 'all/unstaged/up',
      up: true,
    });
  } catch (error) {
    res.json({
      id: 'all/unstaged/up',
      up: true,
      error: error.message,
      details: error.details,
    });
  }
});

app.get('/migration-manager/api/procedure/all/up', async (req, res) => {
  try {
    authorize(req);

    const procedures = (await getAllProcedures()).procedures;

    for (const procedure of procedures) {
      await runProcedure(
        procedure.id,
        true,
      );
    }

    res.json({
      id: 'all/up',
      up: true,
    });
  } catch (error) {
    res.json({
      id: 'all/up',
      up: true,
      error: error.message,
      details: error.details,
    });
  }
});

app.get('/migration-manager/api/migration/all/unstaged/up', async (req, res) => {
  try {
    authorize(req);

    const procedures = (await getAllProcedures()).procedures;

    for (const procedure of procedures) {
      await runProcedure(
        procedure.id,
        true,
      );
    }

    res.json({
      id: 'all/unstaged/up',
      up: true,
    });
  } catch (error) {
    res.json({
      id: 'all/unstaged/up',
      up: true,
      error: error.message,
      details: error.details,
    });
  }
});

app.get('/migration-manager/api/test-admin-create', async (req, res) => {
  try {
    authorize(req);

    const owner = await testAdminCreate();

    const sql =
      `
      INSERT INTO \`OwnerRole\`
      (\`ownerId\`, \`role\`)
      VALUES(${owner.id}, 'ADMIN')
      `;
    console.log(sql);
    await query(sql);

    res.json(owner);
  } catch (error) {
    console.log(error);
    res.json({
      error: error.message,
    });
  }
});

const port = process.env.PORT || 3334;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/migration-manager/api`);
});
server.on('error', console.error);

async function runMigration (
  id: string,
  up: boolean,
) {
  const sql = fs.readFileSync(
    path.join(__dirname, 'assets', 'migrations',
      `${id}-${up ? 'up': 'down'}.sql`),
    { encoding: 'utf-8' },
  );
  try {

    console.log(sql);
    await query(sql);

    if (up) {
      await query(`
        INSERT INTO \`Migration\`
        (\`id\`)
        VALUES('${id}')
      `);
    } else {
      await query(`
        DELETE FROM \`Migration\`
        WHERE \`id\`='${id}'
      `);
    }
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (error as any).details = sql;
    throw error;
  }
}

async function runProcedure (
  id: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  up: boolean,
) {
  const sql = fs.readFileSync(
    path.join(__dirname, 'assets', 'procedures',
      `${id}`),
    { encoding: 'utf-8' },
  );
  try {

    const [firstPart, ...rest] = sql.split(';');
    const result = [firstPart, rest.join(';')];

    for (const part of result) {
      console.log(part);
      await query(part);
    }
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (error as any).details = sql;
    throw error;
  }
}

async function testAdminCreate () {
  const result
  = await DATA_PROVIDER_API.registerApi.callPromise(
    {
      avatarColor: null,
      avatarUrl: null,
      password: process.env.ADMIN_PASSWORD,
      username: process.env.ADMIN_USERNAME,
    },
    null,
    async (endpoint, method, payload) => {
      const res = await axios.post<Owner>(
        `${process.env.MIDDLEWARE_URL_INTERNAL}${endpoint}`,
        payload,
      );
      return res.data;
    },
  );

  return result;
}

function authorize (request: Request) {
  const pwd = process.env.ADMIN_MIGRATION_PASSWORD || 'anze123';
  if (request.headers.authorization !== 'Bearer ' + pwd)
    throw Error(ERROR_CODE.UNAUTHORIZED);
}

async function getAllMigrations () {
  const files = fs.readdirSync(
    path.join(__dirname, 'assets', 'migrations'),
    { encoding: 'utf-8' },
  );

  const migrations: string[] = [];
  files.forEach(fileName => {
    const cleaned = fileName
      .replace('-down.sql', '')
      .replace('-up.sql', '');

    if (!migrations.includes(cleaned))
      migrations.push(cleaned);

  });
  const migrationObjects = migrations.map(m => ({
    id: m,
    isApplied: false,
  }));

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doneMigrations = await query<any>(
      `
      SELECT * FROM \`Migration\`
      `,
    );

    doneMigrations.forEach(m => {
      const found = migrationObjects.find(item => item.id === m.id);
      if (found) found.isApplied = true;
      else {
        migrationObjects.push({
          isApplied: false,
          id: m.id,
        });
      }
    });
  } catch (error) {
    //
  }

  migrationObjects.sort((a, b) => {
    const numA = Number(splitByFirst(a.id, '-')[0]);
    const numB = Number(splitByFirst(b.id, '-')[0]);
    if (numA < numB) return -1;
    if (numA > numB) return 1;
    return 0;
  });

  return { migrations: migrationObjects };
}

async function getAllProcedures () {
  const files = fs.readdirSync(
    path.join(__dirname, 'assets', 'procedures'),
    { encoding: 'utf-8' },
  );

  const procedures: string[] = [];
  files.forEach(fileName => {
    procedures.push(fileName);
  });
  const proceduresMap = procedures.map(m => ({
    id: m,
    isApplied: false,
  }));

  return { procedures: proceduresMap };
}

function splitByFirst (str: string, delimiter: string): [string, string] {
  const [firstPart, ...rest] = str.split(delimiter);
  return [firstPart, rest.join(delimiter)];
}
