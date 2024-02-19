import { ERROR_CODE } from '@angular-monorepo/entities';
import { Entity, EntityPropertyType } from '../types';
import { query } from './connection';

export async function lastInsertId (): Promise<number> {
  const lidRes
        = await query<{
            'LAST_INSERT_ID()': number
        }[]>('SELECT LAST_INSERT_ID()');

  if (!lidRes.length)
    throw Error(ERROR_CODE.LAST_INSERT_ID_ERROR);

  return lidRes[0]['LAST_INSERT_ID()'];
}

export function insertSql(
  tableName: string,
  entity: Entity,
  data: unknown,
): string {
  let columns = '';
  let values = '';

  let index = 0;
  for (const [column, type] of Object.entries(entity)) {
    if (type === EntityPropertyType.AUTO_ID) {
      //
    }
    else {
      if (index !== 0) {
        columns += ', ';
        values += ', ';
      };
      columns += '`' + column + '`';
  
      values += addValue(type, column, data);
      index++;
    }
  }

  const sql = 'INSERT INTO '
          + '`' + tableName + '`'
          + ' (' + columns + ') '
          + 'VALUES(' + values + ')';

  return sql;
}

export function insertMultipleSql(
  tableName: string,
  entity: Entity,
  data: unknown[],
): string {
  let columns = '';
  let values = '';

  let index = 0;
  for (const [column, type] of Object.entries(entity)) {
    if (type !== EntityPropertyType.AUTO_ID) {
      if (index !== 0) {
        columns += ', ';
      };
      columns += '`' + column + '`';
      index++;
    }
  }

  let index2 = 0;
  for (const dataPoint of data) {
    if (index2 !== 0) {
      values += ', ';
    };

    values += '(';

    let index3 = 0;
    for (const [column, type] of Object.entries(entity)) {
      if (type !== EntityPropertyType.AUTO_ID) {
        if (index3 !== 0) {
          values += ', ';
        };
  
        values += addValue(type, column, dataPoint);
        index3++;
      }
    }

    values += ')';
    index2++;
  }

  const sql = 'INSERT INTO '
          + '`' + tableName + '`'
          + ' (' + columns + ') '
          + 'VALUES' + values;

  return sql;
}

function addValue (
  type: EntityPropertyType,
  column: string,
  data: unknown,
) {
  let values = '';
  if (type === EntityPropertyType.BOOL) {
    values += data[column] ? 1 : 0;
  }
  else if (type === EntityPropertyType.NULLABLE_ID) {
    values += data[column] === null ? 'NULL' : (String(data[column]));
  }
  else if (type === EntityPropertyType.BLOB) {
    values += data[column] === null ? 'NULL' : '\'' + (String(data[column])) + '\'';
  }
  else if (type === EntityPropertyType.ID) {
    values += String(data[column]);
  }
  else if (type === EntityPropertyType.JSON) {
    values += '\'' + JSON.stringify(data[column]) + '\'';
  }
  else if (type === EntityPropertyType.DATETIME) {
    values += '\'' + data[column].toISOString().slice(0, 19).replace('T', ' ') + '\'';
  }
  else values += '\'' + String(data[column]) + '\'';
  return values;
}

export async function selectSql<T>(
  sql: string,
  entity: Entity,
): Promise<T> {
  const res = await query<Record<string, unknown>[]>(sql);

  const mapped = res.map(row => {
    const accumulator: Record<string, unknown> = {};
    Object.entries(entity).forEach(([ column, type ]) => {
      if (type === EntityPropertyType.BOOL) {
        accumulator[column] = row[column] === 1 ? true : false;
      }
      else if (type === EntityPropertyType.JSON) {
        accumulator[column] = JSON.parse(row[column] as string);
      }
      else accumulator[column] = row[column];
    });
    return accumulator;
  });

  return mapped as T;
}

export async function selectOneWhereSql<T>(
  tableName: string,
  property: string,
  propertyType: EntityPropertyType,
  value: unknown,
  entity: Entity,
): Promise<T> {

  const sql
    = createSelectWhereClause(tableName, property, propertyType, value);
  const res = await query<Record<string, unknown>[]>(sql);

  const mapped = mapSelectRows(res, entity);

  if (mapped.length === 0)
    throw Error(ERROR_CODE.RESOURCE_NOT_FOUND);
  if (mapped.length > 1)
    throw Error(ERROR_CODE.REQUESTED_ONE_FOUND_MULTIPLE);

  return mapped[0] as T;
}
export async function selectMaybeOneWhereSql<T>(
  tableName: string,
  property: string,
  propertyType: EntityPropertyType,
  value: unknown,
  entity: Entity,
): Promise<T | null> {

  const sql
    = createSelectWhereClause(tableName, property, propertyType, value);
  const res = await query<Record<string, unknown>[]>(sql);

  const mapped = mapSelectRows(res, entity);

  if (mapped.length > 1)
    throw Error(ERROR_CODE.REQUESTED_ONE_FOUND_MULTIPLE);

  return mapped[0] ? mapped[0] as T : null;
}


export async function selectWhereSql<T>(
  tableName: string,
  property: string,
  propertyType: EntityPropertyType,
  value: unknown,
  entity: Entity,
): Promise<T> {

  const sql
    = createSelectWhereClause(tableName, property, propertyType, value);
  const res = await query<Record<string, unknown>[]>(sql);

  const mapped = mapSelectRows(res, entity);

  return mapped as T;
}

function mapSelectRows (
  selectResult: Record<string, unknown>[],
  entity: Entity,
) {
  const mapped = selectResult.map(row => {
    const accumulator: Record<string, unknown> = {};
    Object.entries(entity).forEach(([ column, type ]) => {
      if (type === EntityPropertyType.BOOL) {
        accumulator[column] = row[column] === 1 ? true : false;
      }
      else if (type === EntityPropertyType.JSON) {
        accumulator[column] = JSON.parse(row[column] as string);
      }
      else if (type === EntityPropertyType.BLOB) {
        if (row[column]) {
          accumulator[column] = (row[column] as Buffer).toString();
        } else {
          accumulator[column] = null;
        }
      }
      else accumulator[column] = row[column];
    });
    return accumulator;
  });

  return mapped;
}

function createSelectWhereClause (
  tableName: string,
  property: string,
  propertyType: EntityPropertyType,
  value: unknown,
): string {
  let sql
    = `SELECT * FROM \`${tableName}\` WHERE `;
  if (propertyType === EntityPropertyType.BOOL) {
    sql += `\`${property}\` = ${value ? 1 : 0}`;
  }
  else if (propertyType === EntityPropertyType.NOT_NULL_INT) {
    sql += `\`${property}\` = ${value}`;
  }
  else {
    sql += `\`${property}\` = "${value}"`;
  }

  return sql;
}
