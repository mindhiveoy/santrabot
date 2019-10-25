/**
 * # startSession.ts
 *
 * Start a new chat session.  When created, session will get its own session token. After session has been
 * greated, all chat message pairs can be stored under the session document.
 *
 * @author Ville Venäläinen
 */
import { stringifyRiveInternals } from '@shared/bot/intepreter';
import { ChatSession, Schema } from '@shared/schema';
import { mapObjectToOutput } from '@shared/utils/objectTools';
import admin from '../../../admin';
import getSessionManager from '../../bot-backend/session';

export default async function startSession({ organizationId }) {
  try {
    console.info(`Starting session for organization ${organizationId}`);

    const ref = admin
      .firestore()
      .collection(Schema.ORGANIZATIONS)
      .doc(organizationId);

    const organizationDoc = await ref.get();

    if (!organizationDoc.exists) {
      const message = `Organization with id ${organizationId} was not found.`;
      console.error(message);
      throw Error(message);
    }

    const chatSession: ChatSession = {
      started: admin.firestore.FieldValue.serverTimestamp(),
    };

    const chatSessionDoc = await ref.collection(Schema.CHAT_SESSIONS).add(chatSession);

    const sessionToken = chatSessionDoc.id;

    // in anonymous chat session token will be used as user name
    getSessionManager().init(sessionToken);

    let userVariables = await getSessionManager().getAny(sessionToken);
    userVariables = userVariables ? mapObjectToOutput(stringifyRiveInternals(userVariables)) : userVariables;

    return {
      sessionToken,
      userVariables,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
