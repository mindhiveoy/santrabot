import { encodeToFieldName, PendingUserInfo, Schema, User, UserRole } from '@shared/schema';
import { ShortUserInfo } from '@shared/schema';
import admin from 'admin';
import { UserRecord } from 'firebase-functions/lib/providers/auth';
import { exposeMockFirebaseAdminApp, MockDatabase } from 'ts-mock-firebase';

import { _onUserCreated } from '..';

const firestore = exposeMockFirebaseAdminApp(admin).firestore();

describe('On New User Created', () => {
  const displayName = 'Matti Meikäläinen';
  const email = 'matti.meikalainen@acme.fi';
  const uid = 'userid';
  const oid = 'acme';
  const organizationName = 'Acme Oy';

  describe('Pending Users', () => {
    const pendingData: PendingUserInfo = {
      organizations: {
        [oid]: UserRole.ADMIN,
      },
    };

    it('will remove user from pending users and add it to organization users and users collection', async () => {
      const database: MockDatabase = {
        [Schema.ORGANIZATIONS]: {
          docs: {
            [oid]: {
              data: {
                name: organizationName,
                users: {
                  another: {
                    displayName: 'Someone Else',
                    email: 'someone@acme.fi',
                  } as ShortUserInfo,
                },
                roles: {
                  another: UserRole.USER,
                },
              },
            },
          },
        },
        [Schema.PENDING_USERS]: {
          docs: {
            [email]: {
              data: pendingData,
            },
          },
        },
      };

      firestore.mocker.fromMockDatabase(database);

      const userRecord: UserRecord = {
        uid,
        email,
        emailVerified: false,
        displayName,
        phoneNumber: undefined,
        photoURL: undefined,
        disabled: false,
        metadata: {} as any,
        providerData: [],
        toJSON: jest.fn(),
      };

      await _onUserCreated(userRecord);

      /*
       * User record is created under users collection with the firebase's given uid
       */
      const user = await firestore.doc(`${Schema.USERS}/${uid}`).get();
      expect(user.exists).toBeTruthy();

      const expectedUser: User = {
        id: uid,
        displayName,
        email,
        organizations: { acme: { name: 'Acme Oy', role: UserRole.ADMIN } },
        photoURL: '',
      };
      expect(user.data()).toEqual(expectedUser);

      // user is removed from the pending list
      const pendingUser = await firestore.doc(`${Schema.PENDING_USERS}/${email}`).get();
      expect(pendingUser.exists).toBeFalsy();
    });
  });

  it('Will add a pending user to organization with defined role and remove him or her from pending users.', async () => {
    const pendingData: PendingUserInfo = {
      organizations: {
        [oid]: UserRole.ADMIN,
      },
    };
    const database: MockDatabase = {
      [Schema.ORGANIZATIONS]: {
        docs: {
          [oid]: {
            data: {
              name: organizationName,
              users: {
                another: {
                  displayName: 'Someone Else',
                  email: 'someone@acme.fi',
                } as ShortUserInfo,
                [encodeToFieldName(email)]: {
                  pending: true,
                  email,
                },
              },
              roles: {
                another: UserRole.USER,
              },
            },
          },
        },
      },
      [Schema.PENDING_USERS]: {
        docs: {
          [email]: {
            data: pendingData,
          },
        },
      },
    };
    firestore.mocker.fromMockDatabase(database);

    const userRecord: UserRecord = {
      uid,
      email,
      emailVerified: false,
      displayName,
      phoneNumber: undefined,
      photoURL: undefined,
      disabled: false,
      metadata: {} as any,
      providerData: [],
      toJSON: jest.fn(),
    };
    await _onUserCreated(userRecord);

    // user must be added to organization
    const data = firestore.doc(`${Schema.ORGANIZATIONS}/acme`).mocker.getData();
    expect(data).toEqual({
      name: organizationName,
      roles: {
        another: UserRole.USER,
        [uid]: UserRole.ADMIN,
      },
      users: {
        another: {
          displayName: 'Someone Else',
          email: 'someone@acme.fi',
        } as ShortUserInfo,
        userid: {
          id: uid,
          displayName,
          email,
          photoURL: '',
        },
      },
    });

    /*
     * User record is created under users collection with the firebase's given uid
     */

    const userData = firestore.doc(`${Schema.USERS}/${uid}`).mocker.getData();
    const expectedUser: User = {
      id: uid,
      displayName,
      email,
      organizations: { acme: { name: 'Acme Oy', role: UserRole.ADMIN } },
      photoURL: '',
    };
    expect(userData).toEqual(expectedUser);

    // user is removed from the pending list
    const pendingUser = await firestore.doc(`${Schema.PENDING_USERS}/${email}`).get();
    expect(pendingUser.exists).toBeFalsy();
  });
});
