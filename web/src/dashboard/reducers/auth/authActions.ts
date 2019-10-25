import { OrganizationId, User, UserRead } from '@shared/schema';
import store from 'dashboard/reduxStore';
import firebaseApp from 'firebaseApp';
import { ActionCreator, AnyAction } from 'redux';
import { isBrowser } from 'utils/environment';

export const enum AuthActionType {
  /**
   * User state on firebase auth changed. Hapens on sign in and out
   */
  AUTH_FIREBASE_USER_STATE_CHANGED = 'AUTH_FIREBASE_USER_STATE_CHANGED',
  /**
   * Update last error to state
   */
  AUTH_FIREBASE_SET_ERROR = 'AUTH_FIREBASE_SET_ERROR',
  /**
   * Set authentication status
   */
  AUTH_FIREBASE_SET_AUTHENTICATING = 'AUTH_FIREBASE_SET_AUTHENTICATING',
  /**
   * Trigger when app specific user info has changed or loaded.
   */
  AUTH_APP_USER_INFO_UPDATED = 'AUTH_APP_USER_INFO_UPDATED',
  /**
   * User has switched between his or her active organization.
   */
  AUTH_APP_USER_ACTIVE_ORG_CHANGED = 'AUTH_APP_USER_ACTIVE_ORG_CHANGED',
}

export interface FirebaseUserAuthStateChangedAction extends AnyAction {
  type: AuthActionType.AUTH_FIREBASE_USER_STATE_CHANGED;
  payload?: firebase.User;
}

export interface AppUserAuthStateChangedAction extends AnyAction {
  type: AuthActionType.AUTH_APP_USER_INFO_UPDATED;
  payload?: User;
}

export interface FirebaseAuthSetErrorAction extends AnyAction {
  type: AuthActionType.AUTH_FIREBASE_SET_ERROR;
  payload: firebase.auth.Error;
}

export interface AppUserActiveOrganizationChangedAction extends AnyAction {
  type: AuthActionType.AUTH_APP_USER_ACTIVE_ORG_CHANGED;
  payload: OrganizationId;
}

export const firebaseUserStateChanged: ActionCreator<FirebaseUserAuthStateChangedAction> = (
  user: firebase.User | undefined,
) => ({
  type: AuthActionType.AUTH_FIREBASE_USER_STATE_CHANGED,
  payload: user,
});

export const appUserStateChanged: ActionCreator<AppUserAuthStateChangedAction> = (user: UserRead | undefined) => ({
  type: AuthActionType.AUTH_APP_USER_INFO_UPDATED,
  payload: user,
});

export const updateFirestoreAuthError: ActionCreator<FirebaseAuthSetErrorAction> = (error: firebase.auth.Error) => ({
  type: AuthActionType.AUTH_FIREBASE_SET_ERROR,
  payload: error,
});

export const appUserActiveOrganizationChanged: ActionCreator<AppUserActiveOrganizationChangedAction> = (
  organizationId: OrganizationId,
) => ({
  type: AuthActionType.AUTH_APP_USER_ACTIVE_ORG_CHANGED,
  payload: organizationId,
});

let unsubscribeUser: () => void;

if (isBrowser()) {
  firebaseApp.auth().onAuthStateChanged(user => {
    if (user) {
      unsubscribeUser = firebaseApp
        .firestore()
        .collection('users')
        .doc(user.uid)
        .onSnapshot(snapshot => {
          store.dispatch(appUserStateChanged(snapshot.data()));
        });
    } else {
      unsubscribeUser && unsubscribeUser();
      store.dispatch(appUserStateChanged(undefined));
    }
    store.dispatch(firebaseUserStateChanged(user));
  });
}

export type AuthAction = AnyAction | FirebaseUserAuthStateChangedAction;
