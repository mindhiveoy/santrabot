/**
 * # deleteChatSession.ts
 *
 * Delete a single chat session.
 *
 * @author Ville Venäläinen
 */
import { Schema, SucceedResponse } from '@shared/schema';
import admin from '../../../admin';

export default async function deleteChatSession({ organizationId, sessionId }): Promise<SucceedResponse> {
  try {
    console.info(`Starting to delete chat session ${sessionId} of organization: ${organizationId}`);

    await deleteCollection(
      admin.firestore(),
      `/${Schema.ORGANIZATIONS}/${organizationId}/${Schema.CHAT_SESSIONS}/${sessionId}/${Schema.CHAT_MESSAGES}`,
      50,
    );

    await admin
      .firestore()
      .doc(`/${Schema.ORGANIZATIONS}/${organizationId}/${Schema.CHAT_SESSIONS}/${sessionId}`)
      .delete();

    return {
      succeed: true,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

function deleteCollection(db, collectionPath, batchSize) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, batchSize, resolve, reject);
  });
}

function deleteQueryBatch(db, query, batchSize, resolve, reject) {
  query
    .get()
    .then(snapshot => {
      // When there are no documents left, we are done
      if (snapshot.size === 0) {
        return 0;
      }

      // Delete documents in a batch
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      return batch.commit().then(() => {
        return snapshot.size;
      });
    })
    .then(numDeleted => {
      if (numDeleted === 0) {
        resolve();
        return;
      }

      // Recurse on the next process tick, to avoid exploding the stack.
      process.nextTick(() => {
        deleteQueryBatch(db, query, batchSize, resolve, reject);
      });
    })
    .catch(reject);
}
