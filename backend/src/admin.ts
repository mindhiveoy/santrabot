/**
 * Set up a default app connection
 */
import * as admin from 'firebase-admin';

// We use always the default app
export const adminApp = admin.initializeApp();

export default admin;
