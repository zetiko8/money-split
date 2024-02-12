import { randomUUID } from 'crypto';
import { lastInsertId, query } from '../connection/connection';
import { insertSql, selectWhereSql } from '../connection/helper';
import { EntityPropertyType, InvitationEntity, MNamespaceEntity, OwnerEntity } from '../types';
import { ERROR_CODE, Invitation, MNamespace, NamespaceView, Owner, User } from '@angular-monorepo/entities';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { addOwnerToNamespace } from '../modules/namespace';

export async function createNamespace (
  name: string,
  ownerId: number,
): Promise<MNamespace> {

  const namespaces = await query<MNamespace[]>
  (`
  SELECT * FROM NamespaceOwner no2 
  INNER JOIN Namespace n 
  ON n.id = no2.namespaceId
  WHERE no2.ownerId = ${ownerId}
  AND n.name = "${name}"
  `);

  if (namespaces.length)
    throw Error(ERROR_CODE.RESOURCE_ALREADY_EXISTS);

  await query(insertSql(
    'Namespace',
    MNamespaceEntity,
    { name }
  ));

  const namespaceId = await lastInsertId();

  await addOwnerToNamespace(ownerId, namespaceId);

  return {
    id: namespaceId,
    name,
  };
}

export async function getNamespaceForOwner (
  namespaceId: number,
  ownerId: number,
): Promise<MNamespace> {

  const namespaces = await query<MNamespace[]>
    (
      `
      SELECT * FROM NamespaceOwner no2 
      INNER JOIN Namespace n 
      ON n.id = no2.namespaceId
      WHERE no2.ownerId = ${ownerId}
      AND n.id = ${namespaceId}
      `
    );

  if (!namespaces.length)
    throw Error(ERROR_CODE.RESOURCE_NOT_FOUND);

  return namespaces[0];
}

export async function getNamespaceViewForOwner (
  namespaceId: number,
  ownerId: number,
): Promise<NamespaceView> {

  const namespaces = await query<MNamespace[]>
    (
      `
      SELECT * FROM NamespaceOwner no2 
      INNER JOIN Namespace n 
      ON n.id = no2.namespaceId
      WHERE no2.ownerId = ${ownerId}
      AND n.id = ${namespaceId}
      `
    );

  if (!namespaces.length)
    throw Error(ERROR_CODE.RESOURCE_NOT_FOUND);

  const invitations = (await selectWhereSql<Invitation[]>(
    'Invitation', 
    'namespaceId', 
    EntityPropertyType.ID,
    namespaceId,
    InvitationEntity,
  )).filter(invitation => !invitation.accepted);

  const users = await query<User[]>
  (
    `
    SELECT * FROM \`User\` 
    WHERE namespaceId = ${namespaceId}
    `
  );

  const namespaceView: NamespaceView = {
    id: namespaces[0].id,
    name: namespaces[0].name,
    invitations,
    users
  };

  return namespaceView;
}

export async function getNamespacesForOwner (
  ownerId: number,
): Promise<MNamespace[]> {

  const namespaces = await query<MNamespace[]>
    (`
    SELECT * FROM NamespaceOwner no2 
    INNER JOIN Namespace n 
    ON n.id = no2.namespaceId
    WHERE no2.ownerId = ${ownerId}
    `);

  return namespaces;
}

export async function createOwner (
  username: string,
  password: string,
): Promise<Owner> {
  const sameName = await query<Owner[]>(`
  SELECT * FROM \`Owner\`
  WHERE \`username\` = "${username}"`);

  if (sameName.length)
    throw Error(ERROR_CODE.RESOURCE_ALREADY_EXISTS);

  const hash = await bcrypt.hash(password, 10);

  await query(insertSql(
    'Owner',
    OwnerEntity,
    { 
      key: randomUUID(),
      hash,
      username,
    }
  ));

  const id = await lastInsertId();

  const owner = await query<Owner[]>(`
    SELECT * FROM \`Owner\`
    WHERE \`id\` = ${id}`);

  delete (owner[0] as any).hash;

  return owner[0];
}

export async function login (
  username: string,
  password: string,
): Promise<string> {
  const owners = await query<Owner[]>(`
  SELECT * FROM \`Owner\`
  WHERE \`username\` = "${username}"`);

  if (!owners.length)
    throw Error(ERROR_CODE.RESOURCE_NOT_FOUND);

  
  const hash = (owners[0] as any).hash;

  const comparison = await bcrypt.compare(password, hash);
  if (!comparison)
    throw Error(ERROR_CODE.UNAUTHORIZED);

  delete (owners[0] as any).hash;
  const token = await jwtSign(owners[0]);

  return token;
}

function jwtSign (data: any) {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(
      data, 
      'myprivatekey', 
      function(err, token) {
        if (err) return reject(err);
        else return resolve(token as string);
      }
    );
  })
}

export function decodeJwt (token: string) {
  return jwt.verify(
    token, 
    'myprivatekey',
  ) as {
    key: string,
    id: number,
    username: string,
    iat: number
  };
}

export async function inviteToNamespace (
  email: string,
  namespaceId: number,
  ownerId: number,
): Promise<Invitation> {

  const sameEmail = await query<Invitation[]>(`
  SELECT * FROM \`Invitation\`
  WHERE \`email\` = "${email}"`);

  if (sameEmail.length)
    throw Error(ERROR_CODE.RESOURCE_ALREADY_EXISTS);

  await query(insertSql(
    'Invitation',
    InvitationEntity,
    {
      email,
      namespaceId,
      created: new Date(),
      edited: new Date(),
      createdBy: ownerId,
      editedBy: ownerId,
      invitationKey: randomUUID(),
      accepted: false,
      rejected: false,
    }
  ));

  const id = await lastInsertId();

  const invitations = await query<Invitation>(`
    SELECT * FROM \`Invitation\`
    WHERE \`id\` = ${id}`)

  return invitations[0];
}
