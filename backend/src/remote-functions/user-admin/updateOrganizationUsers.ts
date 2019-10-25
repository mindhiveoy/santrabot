import { UpdateData } from '@google-cloud/firestore';
import { encodeToFieldName, Organization, Schema, User, UserAdminMessage, UserRole } from '@shared/schema';
import admin from 'admin';
import * as functions from 'firebase-functions';
import { CallableContext } from 'firebase-functions/lib/providers/https';

/**
 *
 * @param data Input data containing the user admin operations
 * @param context CallableContext
 */
export const _updateOrganizationUsers = async (data: UserAdminMessage, context: CallableContext) => {
  if (!(context.auth && context.auth.uid)) {
    throw new functions.https.HttpsError('permission-denied', 'User must be authenticated to call this operation.');
  }
  const oid = data.oid;
  const firestore = admin.firestore();
  const organizationRef = firestore.doc(`${Schema.ORGANIZATIONS}/${oid}`);
  try {
    await firestore.runTransaction(async transaction => {
      // console.log('Starting transaction');

      const organizationDoc = await transaction.get(organizationRef);
      // in transaction read operations must be done first, so we will go throgh the
      // operations once and solve what kind of update oparations will follow
      const updateOperations: Array<() => void> = [];

      if (!organizationDoc) {
        throw new Error('Organization not found');
      }

      const organization = organizationDoc.data() as Organization;

      const organizationRecordChanges: UpdateData = {};

      const operations = data.operations;
      for (const operation of operations) {
        switch (operation.type) {
          case 'add': {
            // console.log('add');

            const email = operation.userData.email;
            const userUid = await transaction.get(firestore.collection(Schema.USER_EMAILS).doc(email));

            if (userUid.exists) {
              const uid = userUid.data().uid;
              if (!uid) {
                throw new Error(`Internal error, no uid defined for email address: ${email}.`);
              }
              const userRef = firestore.collection(Schema.USERS).doc(uid);
              const userDoc = await transaction.get(userRef);
              const userData = userDoc.data() as User;
              if (!userDoc.exists) {
                throw new Error(`Internal error, no user found for uid: ${uid}.`);
              }
              const displayName = userData.displayName;
              // const photoUrl = userData.photoURL;

              const addUsers = (userId, userEmail, userDisplayName) => {
                return () => {
                  organizationRecordChanges['users.' + userId] = {
                    email: userEmail,
                    displayName: userDisplayName,
                  };
                  organizationRecordChanges['roles.' + userId] = operation.userData.role;

                  transaction.update(userRef, `organizations.${oid}`, operation.userData.role);
                };
              };
              // TODO add user to organization list
              updateOperations.push(addUsers(uid, email, displayName));
            } else {
              // pending user
              console.log('handling a pending user');

              const doAdd = (userEmail: string, role: UserRole) => {
                const encodedEmail = encodeToFieldName(userEmail);

                return () => {
                  organizationRecordChanges['users.' + encodedEmail] = {
                    email,
                    pending: true,
                  };
                  organizationRecordChanges['roles.' + encodedEmail] = operation.userData.role;

                  transaction.set(
                    firestore.collection(Schema.PENDING_USERS).doc(userEmail),
                    {
                      organizations: {
                        [oid]: role,
                      },
                    },
                    {
                      merge: true,
                    },
                  );
                };
              };

              // const userData = userDoc.data() as User;
              updateOperations.push(doAdd(email, operation.userData.role));
            }
            break;
          }
          case 'update': {
            const uid = operation.userData.uid;
            if (uid === context.auth.uid) {
              // todo auth null check
              break;
            }
            if (!uid && operation.userData.email) {
              // updating a pending user
              const email = operation.userData.email;

              const pendingUserRef = firestore.collection(Schema.PENDING_USERS).doc(email);
              const userDoc = await transaction.get(pendingUserRef);
              if (!userDoc.exists) {
                throw new Error(`Internal error, no pending user found for email: ${email} while updating.`);
              }

              const doUpdate = (userEmail: string, role: UserRole) => {
                const encodedEmail = encodeToFieldName(userEmail);
                return () => {
                  organizationRecordChanges[`roles.${encodedEmail}`] = role;

                  transaction.update(pendingUserRef, {
                    [`organizations.${oid}`]: role,
                  });
                };
              };

              // const userData = userDoc.data() as User;
              updateOperations.push(doUpdate(email, operation.userData.role));
            } else {
              const userRef = firestore.collection(Schema.USERS).doc(uid);
              const userDoc = await transaction.get(userRef);
              if (!userDoc.exists) {
                throw new Error(`Internal error, no user found for uid: ${uid}.`);
              }

              const doUpdate = (userId: string, role: UserRole) => {
                return () => {
                  organizationRecordChanges[`roles.${userId}`] = role;

                  transaction.update(userRef, {
                    [`organizations.${oid}`]: {
                      role,
                      name: organization.name,
                    },
                  });
                };
              };

              // const userData = userDoc.data() as User;
              updateOperations.push(doUpdate(operation.userData.uid, operation.userData.role));
            }
            break;
          }
          case 'delete': {
            const uid = operation.userData.uid;
            if (uid === context.auth.uid) {
              // todo auth null check
              break;
            }
            if (!uid && operation.userData.email) {
              // removing a pending user
              const email = operation.userData.email;

              const pendingUserRef = firestore.collection(Schema.PENDING_USERS).doc(email);
              const userDoc = await transaction.get(pendingUserRef);
              if (!userDoc.exists) {
                throw new Error(`Internal error, no pending user found for email: ${email}.`);
              }
              const pendingData = { ...userDoc.data() };
              delete pendingData.organizations[oid];

              const haveOtherPendings = Object.getOwnPropertyNames(pendingData.organizations).length > 0;

              const doDelete = (userEmail: string, havePendings: boolean) => {
                const encodedEmail = encodeToFieldName(userEmail);

                return () => {
                  organizationRecordChanges[`users.${encodedEmail}`] = admin.firestore.FieldValue.delete();
                  organizationRecordChanges[`roles.${encodedEmail}`] = admin.firestore.FieldValue.delete();

                  if (havePendings) {
                    transaction.update(pendingUserRef, {
                      [`organizations.${oid}`]: admin.firestore.FieldValue.delete(),
                    });
                  } else {
                    transaction.delete(pendingUserRef);
                  }
                };
              };

              // const userData = userDoc.data() as User;
              updateOperations.push(doDelete(email, haveOtherPendings));
            } else {
              const userRef = firestore.collection(Schema.USERS).doc(uid);
              const userDoc = await transaction.get(userRef);
              if (!userDoc.exists) {
                throw new Error(`Internal error, no user found for uid: ${uid}.`);
              }

              const doDelete = (userId: string) => {
                return () => {
                  organizationRecordChanges[`users.${userId}`] = admin.firestore.FieldValue.delete();
                  organizationRecordChanges[`roles.${userId}`] = admin.firestore.FieldValue.delete();

                  transaction.update(userRef, {
                    [`organizations.${oid}`]: admin.firestore.FieldValue.delete(),
                  });
                };
              };

              // const userData = userDoc.data() as User;
              updateOperations.push(doDelete(operation.userData.uid));
            }
            break;
          }
          default:
            throw new Error('Not implemented');
        }
      }

      // execute all modifications found on operations
      updateOperations.forEach(operation => operation());
      transaction.update(organizationRef, organizationRecordChanges);
      // console.log('done');
    });

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
/**
 * Add new users to an organization
 */
export const updateOrganizationUsers = functions.https.onCall(_updateOrganizationUsers);
