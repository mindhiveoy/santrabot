import { Organization, ShortUserInfo, User, UserOrganizations } from '@shared/schema';
import { PendingUserInfo, Schema } from '@shared/schema';
import { encodeToFieldName } from '@shared/schema/index';
import admin from 'admin';
import * as functions from 'firebase-functions';
import { EventContext } from 'firebase-functions';
import { UserRecord } from 'firebase-functions/lib/providers/auth';

export const _onUserCreated = async (user: UserRecord, context?: EventContext) => {
  const newUser: User = {
    id: user.uid,
    displayName: user.displayName || '',
    email: user.email || '',
    photoURL: user.photoURL || '',
  };

  const shortUserInfo: ShortUserInfo = {
    ...newUser,
  };

  console.log(`New user registered: ${newUser.displayName} / ${newUser.email}`);

  try {
    await admin.firestore().runTransaction(async transaction => {
      const pendingUserRef = admin
        .firestore()
        .collection(Schema.PENDING_USERS)
        .doc(user.email);

      const pendingUserInfoSnapshot = await transaction.get(pendingUserRef);

      if (pendingUserInfoSnapshot.exists) {
        // User has been assigned to some organizations before registration with some role. Roles are copied to
        // user's personal data and removed from pending list.
        const userInfo: PendingUserInfo = pendingUserInfoSnapshot.data() as PendingUserInfo;

        const orgUpdates: Array<() => void> = [];

        if (userInfo.organizations) {
          const organizations: UserOrganizations = {};
          for (const oid in userInfo.organizations) {
            if (userInfo.organizations.hasOwnProperty(oid)) {
              const orgDoc = await transaction.get(
                admin
                  .firestore()
                  .collection(Schema.ORGANIZATIONS)
                  .doc(oid),
              );
              if (!orgDoc.exists) {
                console.error(
                  `Organization for id "${oid}" not found. Is it been deleted after pending user info creation?`,
                );
                continue;
              }
              const organization = orgDoc.data() as Organization;
              const role = userInfo.organizations[oid];
              organizations[oid] = {
                name: organization.name,
                role,
              };

              orgUpdates.push(() => {
                const encodedEmail = encodeToFieldName(user.email);
                const value = {
                  [`roles.${user.uid}`]: role,
                  [`users.${user.uid}`]: shortUserInfo,
                  [`roles.${encodedEmail}`]: admin.firestore.FieldValue.delete(),
                  [`users.${encodedEmail}`]: admin.firestore.FieldValue.delete(),
                };
                // add user's role and user short infor into organizations ino
                transaction.update(admin.firestore().doc(`${Schema.ORGANIZATIONS}/${oid}`), value);
              });
            }
          }
          newUser.organizations = organizations;
        }
        orgUpdates.forEach(callback => callback());

        transaction.delete(pendingUserRef);
      }
      // Add the user to users's collection with the Firebase uid as a key
      transaction.set(
        admin
          .firestore()
          .collection(Schema.USERS)
          .doc(user.uid),
        newUser,
      );
    });
  } catch (error) {
    console.error('Error: ' + error);
  }
};

/**
 * Procedures done when a new user has authenticated. System will
 * create a counter pair user-object to /user/:userId -path, this object
 * will contain all user state specific info from there on.
 */
export const onUserCreated = functions.auth.user().onCreate(_onUserCreated);
