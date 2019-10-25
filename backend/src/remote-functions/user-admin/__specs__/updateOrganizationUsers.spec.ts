import {
  encodeToFieldName,
  Organization,
  Schema,
  ShortUserInfo,
  User,
  UserAdminMessage,
  UserRole,
} from '@shared/schema';
import admin from 'admin';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import { exposeMockFirebaseAdminApp, MockDatabase } from 'ts-mock-firebase';

import { _updateOrganizationUsers } from '../updateOrganizationUsers';

const firestore = exposeMockFirebaseAdminApp(admin).firestore();

// tslint:disable-next-line: no-big-function
describe('User Administration', () => {
  const mattiEmail = 'matti.meikalainen@acme.fi';
  const mattiUid = 'userid';
  const mattiDisplayName = 'Matti Meikäläinen';

  const defaultContext: CallableContext = {
    auth: {
      uid: mattiUid,
      token: {} as any,
    },
    rawRequest: {} as any,
  };

  describe('Authentication', () => {
    it('Will throw permission denied when auth object is undefined', async () => {
      const noAuthContext: CallableContext = {
        auth: undefined,
        rawRequest: {
          value: 'perkele',
        } as any,
      };
      expect.assertions(1);

      try {
        await _updateOrganizationUsers(undefined as any, noAuthContext);
      } catch (e) {
        expect(e.message).toBe('User must be authenticated to call this operation.');
      }
    });
  });

  describe('Adding Users into an Organization', () => {
    it('Will add new user into pending users when the user is not in system yet.', async () => {
      const database: MockDatabase = {
        organizations: {
          docs: {
            acme: {
              data: {
                users: {
                  another: {
                    displayName: 'Another',
                  },
                },
                roles: {
                  another: UserRole.USER,
                },
              },
            },
          },
        },
      };
      firestore.mocker.fromMockDatabase(database);

      const context: CallableContext = {
        ...defaultContext,
        auth: {
          uid: mattiUid,
          token: {} as any,
        },
      };

      const userAdminMessage: UserAdminMessage = {
        oid: 'acme',
        operations: [
          {
            type: 'add',
            userData: {
              email: mattiEmail,
              role: UserRole.ADMIN,
            },
          },
        ],
      };
      await _updateOrganizationUsers(userAdminMessage, context);

      const data = firestore.doc(`${Schema.ORGANIZATIONS}/acme`).mocker.getData();

      expect(data.roles).toEqual({
        another: UserRole.USER,
        [encodeToFieldName(mattiEmail)]: UserRole.ADMIN,
      });
      expect(data.users).toEqual({
        another: {
          displayName: 'Another',
        },
        [encodeToFieldName(mattiEmail)]: {
          pending: true,
          email: mattiEmail,
        },
      });

      const user = await firestore.doc(`${Schema.PENDING_USERS}/${mattiEmail}`).get();
      expect(user.exists).toBeTruthy();
      const userData = user.data() as User;
      expect(userData.organizations).toEqual({
        acme: UserRole.ADMIN,
      });
    });

    it('Will add new user into organization users when the user is already a member of the system.', async () => {
      const database: MockDatabase = {
        [Schema.ORGANIZATIONS]: {
          docs: {
            acme: {
              data: {
                roles: {
                  abc: UserRole.ADMIN,
                },
                users: {
                  abc: {
                    displayName: 'Another',
                  },
                },
              },
            },
          },
        },
        [Schema.USERS]: {
          docs: {
            [mattiUid]: {
              data: {
                email: mattiEmail,
                displayName: mattiDisplayName,
                organizations: {
                  ducks: UserRole.USER,
                },
              },
            },
            abc: {
              data: {
                email: 'abc@acme.com',
                displayName: 'Another',
                organizations: {
                  acme: UserRole.USER,
                },
              },
            },
          },
        },
        [Schema.USER_EMAILS]: {
          docs: {
            ['abc@acme.com']: {
              data: {
                uid: 'abc',
              },
            },

            [mattiEmail]: {
              data: {
                uid: mattiUid,
              },
            },
          },
        },
      };
      firestore.mocker.fromMockDatabase(database);

      const context: CallableContext = {
        ...defaultContext,

        auth: {
          uid: 'abc',
          token: {} as any,
        },
      };

      const userAdminMessage: UserAdminMessage = {
        oid: 'acme',
        operations: [
          {
            type: 'add',
            userData: {
              email: mattiEmail,
              role: UserRole.ADMIN,
            },
          },
        ],
      };
      await _updateOrganizationUsers(userAdminMessage, context);

      const org = await firestore.doc(`${Schema.ORGANIZATIONS}/acme`).get();
      const data = org.data();
      expect(data.roles).toEqual({
        abc: UserRole.ADMIN,
        [mattiUid]: UserRole.ADMIN,
      });
      expect(data.users).toEqual({
        abc: {
          displayName: 'Another',
        },
        [mattiUid]: {
          email: mattiEmail,
          displayName: mattiDisplayName,
        },
      });
      const pendingUser = await firestore.doc(`${Schema.PENDING_USERS}/${mattiEmail}`).get();
      expect(pendingUser.exists).toBeFalsy();

      const user = await firestore.doc(`${Schema.USERS}/${mattiUid}`).get();
      expect(user.exists).toBeTruthy();

      const userData = user.data() as User;
      expect(userData.organizations).toEqual({
        acme: UserRole.ADMIN,
        ducks: UserRole.USER,
      });
    });
  });

  // tslint:disable-next-line: no-big-function
  describe('Removing user roles from Organization', () => {
    it('Will remove listed users from organization when user is admin in the targeting organization', async () => {
      // TODO this will require security rule checking
      const database: MockDatabase = {
        [Schema.ORGANIZATIONS]: {
          docs: {
            acme: {
              data: {
                users: {
                  user1: {
                    displayName: 'User 1',
                  },
                  user2: {
                    displayName: 'User 2',
                  },
                  user3: {
                    displayName: 'User 3',
                  },
                  [mattiUid]: {
                    displayName: mattiDisplayName,
                  },
                },
                roles: {
                  user1: UserRole.USER,
                  user2: UserRole.USER,
                  user3: UserRole.USER,
                  [mattiUid]: UserRole.ADMIN,
                },
              },
            },
          },
        },
        [Schema.USERS]: {
          docs: {
            user1: {
              data: { uid: 'user1' },
            },
            user2: {
              data: { uid: 'user2' },
            },
            user3: {
              data: { uid: 'user3' },
            },
            [mattiUid]: {
              data: { uid: mattiUid },
            },
          },
        },
      };
      firestore.mocker.fromMockDatabase(database);

      const context: CallableContext = {
        ...defaultContext,

        auth: {
          uid: mattiUid,
          token: {} as any,
        },
      };

      const userAdminMessage: UserAdminMessage = {
        oid: 'acme',
        operations: [
          {
            type: 'delete',
            userData: {
              uid: 'user2',
            },
          },
          {
            type: 'delete',
            userData: {
              uid: 'user1',
            },
          },
        ],
      };
      await _updateOrganizationUsers(userAdminMessage, context);

      try {
        const org = await firestore.doc(`${Schema.ORGANIZATIONS}/acme`).get();
        const data = org.data() as Organization;
        expect(data.roles).toEqual({
          user3: UserRole.USER,
          [mattiUid]: UserRole.ADMIN,
        });
      } catch (error) {
        expect(error).toMatch('no-can-do');
      }
    });
    it('Will remove listed users from organization when user is system admin.', async () => {
      const database: MockDatabase = {
        [Schema.ORGANIZATIONS]: {
          docs: {
            acme: {
              data: {
                users: {
                  user1: { uid: 'user3' },
                  user2: { uid: 'user2' },
                  user3: { uid: 'user3' },
                  [mattiUid]: { uid: mattiUid },
                },
                roles: {
                  user1: UserRole.USER,
                  user2: UserRole.USER,
                  user3: UserRole.PENDING,
                  [mattiUid]: UserRole.ADMIN,
                },
              },
            },
          },
        },
        [Schema.USERS]: {
          docs: {
            user1: {
              data: {
                uid: 'user1',
                organizations: {
                  acme: {
                    name: 'Acme',
                    role: UserRole.USER,
                  },
                },
              },
            },
            user2: {
              data: {
                uid: 'user2',
                organizations: {
                  acme: {
                    name: 'Acme',
                    role: UserRole.USER,
                  },
                },
              },
            },
            user3: {
              data: {
                uid: 'user3',
                organizations: {
                  acme: {
                    name: 'Acme',
                    role: UserRole.USER,
                  },
                },
              },
            },
            [mattiUid]: {
              data: {
                uid: mattiUid,
                organizations: {
                  acme: {
                    name: 'Acme',
                    role: UserRole.USER,
                  },
                },
                systemAdmin: true,
              },
            },
          },
        },
      };
      firestore.mocker.fromMockDatabase(database);

      const context: CallableContext = {
        ...defaultContext,

        auth: {
          uid: mattiUid,
          token: {} as any,
        },
      };

      const userAdminMessage: UserAdminMessage = {
        oid: 'acme',
        operations: [
          {
            type: 'delete',
            userData: {
              uid: 'user2',
            },
          },
          {
            type: 'delete',
            userData: {
              uid: 'user1',
            },
          },
        ],
      };
      await _updateOrganizationUsers(userAdminMessage, context);

      const org = await firestore.doc(`${Schema.ORGANIZATIONS}/acme`).get();
      const data = org.data();
      // tslint:disable-next-line: no-useless-cast
      expect(data.users).toEqual({
        user3: { uid: 'user3' },
        [mattiUid]: {
          uid: mattiUid,
        },
      });
      expect(data.roles).toEqual({
        user3: UserRole.PENDING,
        [mattiUid]: UserRole.ADMIN,
      });

      const collection = firestore.collection(Schema.USERS).mocker.getShallowCollection();

      expect(collection).toEqual({
        user1: {
          uid: 'user1',
          organizations: {},
        },
        user2: {
          uid: 'user2',
          organizations: {},
        },
        user3: {
          uid: 'user3',
          organizations: {
            acme: {
              name: 'Acme',
              role: UserRole.USER,
            },
          },
        },
        [mattiUid]: {
          uid: mattiUid,
          organizations: {
            acme: {
              name: 'Acme',
              role: UserRole.USER,
            },
          },
          systemAdmin: true,
        },
      });
    });

    it('Will remove pending users from organization when user is admin in the targeting organization', async () => {
      // TODO this will require security rule checking
      const database: MockDatabase = {
        [Schema.ORGANIZATIONS]: {
          docs: {
            acme: {
              data: {
                roles: {
                  [encodeToFieldName('user1@acme.com')]: UserRole.USER,
                  user2: UserRole.USER,
                  [encodeToFieldName('user3@acme.com')]: UserRole.USER,
                  [encodeToFieldName('user4@acme.com')]: UserRole.USER,
                  [mattiUid]: UserRole.ADMIN,
                },
                users: {
                  [encodeToFieldName('user1@acme.com')]: {
                    email: 'user1@acme.com',
                    pending: true,
                  },
                  user2: {
                    uid: 'user2',
                    email: 'user2@acme.com',
                    displayName: 'User 2',
                  },
                  [encodeToFieldName('user3@acme.com')]: {
                    email: 'user3@acme.com',
                  },
                  [encodeToFieldName('user4@acme.com')]: {
                    email: 'user4@acme.com',
                  },
                  [mattiUid]: {
                    uid: mattiUid,
                    email: mattiEmail,
                    displayName: mattiDisplayName,
                  },
                },
              },
            },
          },
        },
        [Schema.PENDING_USERS]: {
          docs: {
            ['user1@acme.com']: {
              data: {
                organizations: {
                  acme: {
                    name: 'User 1',
                    role: UserRole.USER,
                  },
                },
              },
            },
            ['user3@acme.com']: {
              data: {
                organizations: {
                  acme: {
                    name: 'User 3',
                    role: UserRole.USER,
                  },
                  other: {
                    name: 'User 3',
                    role: UserRole.USER,
                  },
                },
              },
            },
            ['user4@acme.com']: {
              data: {
                organizations: {
                  acme: {
                    name: 'User 4',
                    role: UserRole.USER,
                  },
                  other: {
                    name: 'User 4',
                    role: UserRole.USER,
                  },
                },
              },
            },
          },
        },
        [Schema.USERS]: {
          docs: {
            user2: {
              data: {
                uid: 'user2',
                organizations: {
                  acme: {
                    name: 'Acme',
                    role: UserRole.ADMIN,
                  },
                },
              },
            },
            [mattiUid]: {
              data: {
                uid: mattiUid,
                organizations: {
                  acme: {
                    name: 'Acme',
                    role: UserRole.ADMIN,
                  },
                },
              },
            },
          },
        },
      };
      firestore.mocker.fromMockDatabase(database);

      const context: CallableContext = {
        ...defaultContext,
        auth: {
          uid: mattiUid,
          token: {} as any,
        },
      };

      const userAdminMessage: UserAdminMessage = {
        oid: 'acme',
        operations: [
          {
            type: 'delete',
            userData: {
              email: 'user1@acme.com',
            },
          },
          {
            type: 'delete',
            userData: {
              email: 'user4@acme.com',
            },
          },
        ],
      };
      await _updateOrganizationUsers(userAdminMessage, context);

      // Users will be removed from organization roles and users
      const data = firestore.doc(`${Schema.ORGANIZATIONS}/acme`).mocker.getData() as Organization;

      expect(data.roles).toEqual({
        user2: UserRole.USER,
        [encodeToFieldName('user3@acme.com')]: UserRole.USER,
        [mattiUid]: UserRole.ADMIN,
      });

      expect(data.users).toEqual({
        user2: {
          uid: 'user2',
          email: 'user2@acme.com',
          displayName: 'User 2',
        },
        [encodeToFieldName('user3@acme.com')]: {
          email: 'user3@acme.com',
        },
        [mattiUid]: {
          uid: mattiUid,
          email: mattiEmail,
          displayName: 'Matti Meikäläinen',
        },
      });

      const pendingUsers = firestore.collection(`${Schema.PENDING_USERS}`).mocker.getShallowCollection();
      // User1 will be removed because there no pending into any organization
      expect(pendingUsers).toEqual({
        'user3@acme.com': {
          organizations: {
            acme: {
              name: 'User 3',
              role: UserRole.USER,
            },
            other: {
              name: 'User 3',
              role: UserRole.USER,
            },
          },
        },
        'user4@acme.com': {
          organizations: {
            other: {
              name: 'User 4',
              role: UserRole.USER,
            },
          },
        },
      });
    });
    // tslint:disable-next-line
    // it('Will remove all listed users except him or herself.', () => {});
    // it('Will reject removal if organization would remove all admins.', () => {});
  });

  describe('Updating User info in Organization', () => {
    it('Will update new user info of current users.', async () => {
      const mocker = firestore.mocker;

      const database: MockDatabase = {
        [Schema.ORGANIZATIONS]: {
          docs: {
            acme: {
              data: {
                name: 'Acme',
                users: {
                  user1: {
                    displayName: 'Tupu',
                    email: 'tupu@acme.com',
                  } as ShortUserInfo,
                  user2: {
                    displayName: 'Hupu',
                    email: 'hupu@acme.com',
                  } as ShortUserInfo,
                  user3: { displayName: 'Lupu', email: 'lupu@acme.com' } as ShortUserInfo,
                },
                roles: {
                  user1: UserRole.USER,
                  user2: UserRole.ADMIN,
                  user3: UserRole.CLOSED,
                },
              },
            },
          },
        },
      };
      mocker.fromMockDatabase(database);

      firestore.collection(Schema.USERS).mocker.setShallowCollection({
        user1: {
          displayName: 'Tupu',
          email: 'tupu@acme.com',
          organizations: {
            acme: {
              name: 'Acme',
              role: UserRole.USER,
            },
          },
        },
        user2: {
          displayName: 'Hupu',
          email: 'hupu@acme.com',
          organizations: {
            acme: {
              name: 'Acme',
              role: UserRole.ADMIN,
            },
          },
        },
        user3: {
          displayName: 'Lupu',
          email: 'lupu@acme.com',
          organizations: {
            acme: {
              name: 'Acme',
              role: UserRole.CLOSED,
            },
          },
        },
      });

      const context: CallableContext = {
        ...defaultContext,

        auth: {
          uid: mattiUid,
          token: {} as any,
        },
      };

      const userAdminMessage: UserAdminMessage = {
        oid: 'acme',
        operations: [
          {
            type: 'update',
            userData: {
              uid: 'user1',
              role: UserRole.DISABLED,
            },
          },
          {
            type: 'update',
            userData: {
              uid: 'user3',
              role: UserRole.USER,
            },
          },
        ],
      };
      await _updateOrganizationUsers(userAdminMessage, context);

      const organizationData = firestore.doc(`${Schema.ORGANIZATIONS}/acme`).mocker.getData();

      expect(organizationData.roles).toEqual({
        user1: UserRole.DISABLED,
        user2: UserRole.ADMIN,
        user3: UserRole.USER,
      });

      expect(organizationData.users).toEqual({
        user1: {
          displayName: 'Tupu',
          email: 'tupu@acme.com',
        } as ShortUserInfo,
        user2: {
          displayName: 'Hupu',
          email: 'hupu@acme.com',
        } as ShortUserInfo,
        user3: { displayName: 'Lupu', email: 'lupu@acme.com' } as ShortUserInfo,
      });

      const usersData = firestore.collection(Schema.USERS).mocker.getShallowCollection();

      expect(usersData).toEqual({
        user1: {
          displayName: 'Tupu',
          email: 'tupu@acme.com',
          organizations: {
            acme: {
              name: 'Acme',
              role: UserRole.DISABLED,
            },
          },
        },
        user2: {
          displayName: 'Hupu',
          email: 'hupu@acme.com',
          organizations: {
            acme: {
              name: 'Acme',
              role: UserRole.ADMIN,
            },
          },
        },
        user3: {
          displayName: 'Lupu',
          email: 'lupu@acme.com',
          organizations: {
            acme: {
              name: 'Acme',
              role: UserRole.USER,
            },
          },
        },
      });
    });
  });
});
