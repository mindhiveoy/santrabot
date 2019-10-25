import { OrganizationId, UserOrganizatioInfo, UserRead } from '@shared/schema';
import { Reducer } from 'redux';

import { AuthAction, AuthActionType } from './authActions';

export interface UserOrganizatioInfoWithId extends UserOrganizatioInfo {
  id: OrganizationId;
}

export interface AuthState {
  /**
   * Firebase's user auth info. If authenticated, this will contain
   * the basic info provided by Firebase.
   */
  readonly firebaseUser?: firebase.User;
  /**
   * App specific user info. This info will contain the data that
   * is actually used by the system.
   */
  readonly appUser?: UserRead;
  /**
   * Role of user in current organization
   *
   *  'c' | 'a' | 's' | 'u' | 'd'
   */
  readonly activeRole: any; // TODO correct typing
  /**
   * Current organization for user
   */
  readonly activeOrganization?: UserOrganizatioInfoWithId;

  readonly firebaseError?: firebase.auth.Error;

  /**
   * True if autehntication is in progress
   */
  readonly authenticating: boolean;
}

export const defaultAuthState: AuthState = {
  firebaseUser: undefined,
  appUser: undefined,
  activeRole: 'c',
  activeOrganization: undefined,
  firebaseError: undefined,
  authenticating: false,
};

export const auth: Reducer<AuthState> = (state = defaultAuthState, action: AuthAction) => {
  switch (action.type) {
    case AuthActionType.AUTH_FIREBASE_USER_STATE_CHANGED: {
      return {
        ...state,
        firebaseUser: action.payload,
      };
    }

    case AuthActionType.AUTH_APP_USER_INFO_UPDATED: {
      const appUser = action.payload;

      let activeOrganization: UserOrganizatioInfoWithId | undefined = state.activeOrganization;
      let activeRole = 'c';

      // TODO tests
      if (appUser) {
        if (appUser.organizations) {
          const organizationIds = Object.keys(appUser.organizations);
          if (activeOrganization !== undefined) {
            const ao = activeOrganization;
            activeOrganization = organizationIds.find(id => ao.id === id) ? activeOrganization : undefined;
          } else {
            if (organizationIds.length > 0) {
              const id = organizationIds[0];
              activeOrganization = {
                ...appUser.organizations[id],
                id,
              };
            }
          }
        } else {
          activeOrganization = undefined;
        }

        if (appUser.systemAdmin) {
          activeRole = 's';
        } else {
          if (activeOrganization) {
            activeRole = activeOrganization.role;
          }
        }
      }

      return {
        ...state,
        appUser: action.payload,
        activeOrganization,
        activeRole,
      };
    }

    case AuthActionType.AUTH_APP_USER_ACTIVE_ORG_CHANGED: {
      const activeOrganization =
        state.appUser && state.appUser.organizations
          ? (state.appUser.organizations[action.payload] as UserOrganizatioInfoWithId)
          : state.activeOrganization;
      if (activeOrganization) {
        activeOrganization.id = action.payload;
        return {
          ...state,
          activeOrganization,
        };
      }
      // todo internal error message
      return state;
    }

    default:
      return state;
  }
};
