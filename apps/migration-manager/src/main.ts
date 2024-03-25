import express, { Request } from 'express';
import * as path from 'path';
import * as cors from 'cors';
import fs from 'fs';
import { query } from './connection/connection';
import { ERROR_CODE } from '@angular-monorepo/entities';

const app = express();

app.use(cors.default());
app.use(express.json({ limit: '50mb' }));

app.get('/migration-manager/api', (req, res) => {
  res.json({ message: 'Welcome to migration-manager!' });
});

app.get('/migration-manager/api/migration', async (req, res) => {
  try {
    // authorize(req);

    const files = fs.readdirSync(
      path.join(__dirname, 'assets', 'migrations'),
      { encoding: 'utf-8' }
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
        `
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
  
    res.json({ migrations: migrationObjects });
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

const port = process.env.PORT || 3334;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/migration-manager/api`);
});
server.on('error', console.error);

async function runMigration (
  id: string,
  up: boolean
) {
  const sql = fs.readFileSync(
    path.join(__dirname, 'assets', 'migrations', 
      `${id}-${up ? 'up': 'down'}.sql`),
    { encoding: 'utf-8' }
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

function authorize (request: Request) {
  const pwd = process.env.ADMIN_MIGRATION_PASSWORD || 'anze123';
  if (request.headers.authorization !== 'Bearer ' + pwd)
    throw Error(ERROR_CODE.UNAUTHORIZED)
}
