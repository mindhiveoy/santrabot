/**
 * # FirebaseApp.ts
 *
 * Configuration for the Firebase app.
 *
 * @author Ville Venäläinen
 */

import firebase from 'firebase';
import { isServerSide } from 'utils/environment';

/**
 * Note that firebase modules must be included as external scripts on App.tsx's helmet script
 */
const firebaseApp = firebase.initializeApp(CONFIG.firebase);

if (!isServerSide()) {
  firebaseApp
    .firestore()
    .enablePersistence({ synchronizeTabs: true })
    .then(() => {
      console.log('firestore persistence enabled.');
    })
    .catch((err: any) => {
      switch (err.code) {
        case 'failed-precondition': {
          // Multiple tabs open, persistence can only be enabled
          // in one tab at a a time.
          console.error('Unable to active persistence because of multiple instances of application.');
          break;
        }
        case 'unimplemented':
        default: {
          // The current browser does not support all of the
          // features required to enable persistence
          // ...
          console.error('Unable to active persistence because of legacy browser.');
        }
      }
    });

  const auth = firebaseApp.auth();

  /*
   * Firebase cloud functions's version of auth do not have setPersistence function. So we need to check its
   * existence dynamically and also call it dynamically
   */
  if (auth.setPersistence) {
    auth
      .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(() => {
        console.log('Local auth persistence enabled');
      })
      .catch(error => {
        console.error(error);
      });
  }
}

export default firebaseApp;
