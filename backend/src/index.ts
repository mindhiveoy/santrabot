// import '@babel/polyfill';
import * as functions from 'firebase-functions';
import serverApp from './express-app';

export * from './auth';
export * from './firestore';
export * from './remote-functions';

export const app = functions.https.onRequest(serverApp);
