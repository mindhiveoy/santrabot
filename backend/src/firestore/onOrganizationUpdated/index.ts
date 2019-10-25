import { OrganizationId, Schema, User, UserRole } from '@shared/schema';
import { Organization } from '@shared/schema';
import { PendingUserInfo } from '@shared/schema';
import admin from 'admin';
import * as functions from 'firebase-functions';

export const _onOrganizationUpdatedOrCreated = async (change, context) => {
  const oldOrganizationInfo: Organization | null = change.before.exists ? (change.before.data() as Organization) : null;
  const newOrganizationInfo: Organization | null = change.after.exists ? (change.after.data() as Organization) : null;
  const organizationId: OrganizationId = change.after.id;
  const deletePendings: any =
    oldOrganizationInfo && oldOrganizationInfo.admins ? { ...oldOrganizationInfo.admins } : {};
  // const addPendings: string[] = [];
  // const updateUserRoles: string[] = [];
  console.log(`Organization info updated for ${context.params.organizationId}`);

  for (const email in newOrganizationInfo.admins) {
    if (newOrganizationInfo.admins.hasOwnProperty(email)) {
      const userQuery = admin
        .firestore()
        .collection(Schema.USERS)
        .where('email', '==', email);
      try {
        const userSnapshot = await userQuery.get();
        if (!userSnapshot.empty) {
          // User exists, so we just check if the role needs to be assigned for this organization
          const userDoc = userSnapshot.docs[0];
          const user: User = userDoc.data() as User;
          const organizations = user.organizations ? user.organizations : {};
          organizations[organizationId] = {
            name: newOrganizationInfo.name,
            role: UserRole.ADMIN,
          };
          delete deletePendings[email];

          // Update user organizations
          await admin
            .firestore()
            .doc(`${Schema.USERS}/${userDoc.id}`)
            .set({ ...user, organizations });

          // Update organizations
          const organizationDoc = await admin
            .firestore()
            .collection(Schema.ORGANIZATIONS)
            .doc(organizationId)
            .get();

          if (!organizationDoc.exists) {
            throw new Error(`Organization not found with id ${organizationId}`);
          }

          await organizationDoc.ref.update({
            [`roles.${user.id}`]: UserRole.ADMIN,
            [`users.${user.id}`]: {
              displayName: user.displayName,
              email: user.email,
              id: user.id,
              photoURL: user.photoURL,
            },
          });
        } else {
          // User has been assigned as an admin to an organization, but he or she has not registered yet. This is a common
          // case when a new organization is about start dashboard
          const pendingRef = admin.firestore().doc(`${Schema.PENDING_USERS}/${email}`);
          const pendingUserSnapshot = await pendingRef.get();
          let userInfo: PendingUserInfo;
          if (pendingUserSnapshot.exists) {
            userInfo = pendingUserSnapshot.data();
            userInfo.organizations = userInfo.organizations || {};
            userInfo.organizations[organizationId] = UserRole.ADMIN;
            await pendingRef.set(userInfo);
          } else {
            userInfo = {
              organizations: {
                [organizationId]: UserRole.ADMIN,
              },
            };
            await pendingRef.set(userInfo);
          }
        }
      } catch (error) {
        console.error('Error: ' + error);
      }
    }
  }

  // Remove
  if (Object.keys(deletePendings).length) {
    for (const email in deletePendings) {
      try {
        const querySnapshot = await admin
          .firestore()
          .collection(Schema.USERS)
          .where('email', '==', email)
          .get();

        if (querySnapshot.empty) {
          // check from pending users, remove if found
          const pendingUserDoc = await admin
            .firestore()
            .collection(Schema.PENDING_USERS)
            .doc(email)
            .get();
          if (pendingUserDoc.exists) {
            const pendingUser = pendingUserDoc.data() as PendingUserInfo;
            if (pendingUser.organizations && pendingUser.organizations[newOrganizationInfo.id]) {
              if (
                Object.keys(pendingUser.organizations).length === 1 &&
                pendingUser.organizations[newOrganizationInfo.id]
              ) {
                // if pending user have only one organization and we are deleting it, we can delete entire doc
                await pendingUserDoc.ref.delete();
              } else {
                // we only delete organization
                await pendingUserDoc.ref.update({
                  [`organizations.${newOrganizationInfo.id}`]: admin.firestore.FieldValue.delete(),
                });
              }
            }
          }
        } else {
          // remove user information from organization by user id
          const user = querySnapshot.docs[0].data() as User;
          if (user.id) {
            await admin
              .firestore()
              .collection(Schema.ORGANIZATIONS)
              .doc(newOrganizationInfo.id)
              .update({
                [`roles.${user.id}`]: admin.firestore.FieldValue.delete(),
                [`users.${user.id}`]: admin.firestore.FieldValue.delete(),
              });
          }

          // remove organization info from user
          await querySnapshot.docs[0].ref.update({
            [`organizations.${newOrganizationInfo.id}`]: admin.firestore.FieldValue.delete(),
          });
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
};
/**
 * Do required operation when organization info has been saved.
 *
 * - 1. update admin user info based admins-array on organization info
 */
export const onOrganizationUpdatedOrCreated = functions.firestore
  .document(`${Schema.ORGANIZATIONS}/{organizationId}`)
  .onWrite(_onOrganizationUpdatedOrCreated);
