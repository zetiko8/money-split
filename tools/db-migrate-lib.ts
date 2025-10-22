import { createConnection, Connection } from 'mysql2';
import * as fs from 'fs';
import * as path from 'path';

export interface MigrationInfo {
  id: string;
  isApplied: boolean;
}

export interface DbConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
}

export class DatabaseMigrationManager {
  private connection: Connection;
  private migrationsPath: string;
  private proceduresPath: string;

  constructor(
    config: DbConfig,
    migrationsPath: string,
    proceduresPath: string,
  ) {
    this.connection = createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
      port: config.port,
    });
    this.migrationsPath = migrationsPath;
    this.proceduresPath = proceduresPath;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection.connect((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      this.connection.end(() => resolve());
    });
  }

  private async query<T>(sql: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, (err, rows) => {
        if (err) return reject(err);
        else return resolve(rows as unknown as T);
      });
    });
  }

  async getAllMigrations(): Promise<MigrationInfo[]> {
    const files = fs.readdirSync(this.migrationsPath, { encoding: 'utf-8' });

    const migrations: string[] = [];
    files.forEach((fileName) => {
      const cleaned = fileName.replace('-down.sql', '').replace('-up.sql', '');

      if (!migrations.includes(cleaned)) migrations.push(cleaned);
    });

    const migrationObjects: MigrationInfo[] = migrations.map((m) => ({
      id: m,
      isApplied: false,
    }));

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const doneMigrations = await this.query<any>(
        `SELECT * FROM \`Migration\``,
      );

      doneMigrations.forEach((m: { id: string }) => {
        const found = migrationObjects.find((item) => item.id === m.id);
        if (found) found.isApplied = true;
        else {
          migrationObjects.push({
            isApplied: true,
            id: m.id,
          });
        }
      });
    } catch (error) {
      // Migration table might not exist yet
    }

    migrationObjects.sort((a, b) => {
      const numA = Number(this.splitByFirst(a.id, '-')[0]);
      const numB = Number(this.splitByFirst(b.id, '-')[0]);
      if (numA < numB) return -1;
      if (numA > numB) return 1;
      return 0;
    });

    return migrationObjects;
  }

  async runMigration(id: string, up: boolean): Promise<void> {
    const sqlPath = path.join(
      this.migrationsPath,
      `${id}-${up ? 'up' : 'down'}.sql`,
    );

    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Migration file not found: ${sqlPath}`);
    }

    const sql = fs.readFileSync(sqlPath, { encoding: 'utf-8' });

    try {
      await this.query(sql);

      if (up) {
        await this.query(`
          INSERT INTO \`Migration\`
          (\`id\`)
          VALUES('${id}')
        `);
      } else {
        await this.query(`
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

  async runProcedure(fileName: string): Promise<void> {
    const sqlPath = path.join(this.proceduresPath, fileName);

    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Procedure file not found: ${sqlPath}`);
    }

    const sql = fs.readFileSync(sqlPath, { encoding: 'utf-8' });

    try {
      const [firstPart, ...rest] = sql.split(';');
      const parts = [firstPart, rest.join(';')];

      for (const part of parts) {
        if (part.trim()) {
          await this.query(part);
        }
      }
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error as any).details = sql;
      throw error;
    }
  }

  async getAllProcedures(): Promise<string[]> {
    const files = fs.readdirSync(this.proceduresPath, { encoding: 'utf-8' });
    return files.filter((f) => f.endsWith('.sql'));
  }

  async runAllPendingMigrations(): Promise<string[]> {
    const migrations = await this.getAllMigrations();
    const pending = migrations.filter((m) => !m.isApplied);
    const executed: string[] = [];

    for (const migration of pending) {
      await this.runMigration(migration.id, true);
      executed.push(migration.id);
    }

    return executed;
  }

  async runAllMigrations(): Promise<string[]> {
    const migrations = await this.getAllMigrations();
    const executed: string[] = [];

    for (const migration of migrations) {
      if (!migration.isApplied) {
        console.log(migration.id);
        await this.runMigration(migration.id, true);
        executed.push(migration.id);
      }
    }

    return executed;
  }

  async rollbackLastMigration(): Promise<string | null> {
    const migrations = await this.getAllMigrations();
    const applied = migrations.filter((m) => m.isApplied);

    if (applied.length === 0) {
      return null;
    }

    const lastMigration = applied[applied.length - 1];
    await this.runMigration(lastMigration.id, false);
    return lastMigration.id;
  }

  async resetAllMigrations(): Promise<string[]> {
    const migrations = await this.getAllMigrations();
    const applied = migrations.filter((m) => m.isApplied).reverse();
    const rolledBack: string[] = [];

    for (const migration of applied) {
      await this.runMigration(migration.id, false);
      rolledBack.push(migration.id);
    }

    return rolledBack;
  }

  async runAllProcedures(): Promise<string[]> {
    const procedures = await this.getAllProcedures();
    const executed: string[] = [];

    for (const procedure of procedures) {
      await this.runProcedure(procedure);
      executed.push(procedure);
    }

    return executed;
  }

  private splitByFirst(str: string, delimiter: string): [string, string] {
    const [firstPart, ...rest] = str.split(delimiter);
    return [firstPart, rest.join(delimiter)];
  }
}
