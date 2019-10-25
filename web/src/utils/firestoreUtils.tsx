import { WithId } from '@shared/schema';

export type PathElement = string;
export type SchemaElementArray = PathElement[];

import * as firebase from 'firebase';
import * as React from 'react';

export function generateTimestamp(): firebase.firestore.Timestamp {
  return firebase.firestore.Timestamp.now();
}

export function getFirestorePath(...path: SchemaElementArray): string {
  let result = '';
  for (const item of path) {
    result += '/' + item;
  }
  return result;
}

export function displayFirebaseAuthError(error: firebase.auth.Error): JSX.Element {
  return (
    <table>
      <tr>
        <td>code</td>
        <td>{error.code}</td>
      </tr>
      <tr>
        <td>message</td>
        <td>{error.message}</td>
      </tr>
    </table>
  );
}

/**
 * Bind document id to document's data to help client side manipulation
 *
 * @param snapshot document snapshot containing document data and id
 */
export function bindDocWithId<T extends WithId>(snapshot: firebase.firestore.DocumentSnapshot): T | undefined {
  if (!snapshot || !snapshot.exists) {
    return undefined;
  }
  return {
    ...(snapshot.data() as T),
    id: snapshot.id,
  };
}

/**
 * Bind id's to all documents in query stanpshot
 */
export function bindDocsWithIds<T extends WithId>(snapshot: firebase.firestore.QuerySnapshot): T[] {
  const list: firebase.firestore.QueryDocumentSnapshot[] = !snapshot.empty ? snapshot.docs : [];

  return list.map(doc => ({
    id: doc.id,
    ...(doc.data() as T),
  }));
}

export const createWriteInfoFields = {
  created: firebase.firestore.FieldValue.serverTimestamp(),
  modified: firebase.firestore.FieldValue.serverTimestamp(),
};

export const updateWriteInfoFields = {
  created: firebase.firestore.FieldValue.serverTimestamp(),
  modified: firebase.firestore.FieldValue.serverTimestamp(),
};
