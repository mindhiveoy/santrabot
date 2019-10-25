import * as mock from 'ts-mock-firebase';

const firebase = mock.mockFirebaseAdmin();

const initializeApp = firebase.initializeApp;

(firebase as any).initializeApp = (...args: any[]) => {
  const app = initializeApp(args);

  (firebase as any).firestore = () => {
    return app.firestore();
  };

  (firebase as any).firestore.FieldValue = mock.MockFieldValue;
  (firebase as any).firestore.FieldPath = mock.MockFieldPath;
  (firebase as any).firestore.Timestamp = mock.MockTimestamp;
};
export = firebase;
