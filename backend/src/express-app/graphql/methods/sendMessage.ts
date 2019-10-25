/**
 * # sendMessage.ts
 *
 * @author Ville Venäläinen
 */
import { parseRiveInternals, stringifyRiveInternals } from '@shared/bot/intepreter';
import { BOT_SUFFIX, ChatMessage, ChatMessageResponse, DEFAULT_BOT_NAME, Schema, USER_SUFFIX } from '@shared/schema';
import { mapInputToObject, mapObjectToOutput } from '@shared/utils/objectTools';
import admin from '../../../admin';
import { getBotBackend } from '../../bot-backend';
import getSessionManager from '../../bot-backend/session';

export default async function sendMessage({
  message,
  sessionToken,
  organizationId,
  userVariables,
}): Promise<ChatMessageResponse> {
  console.log('sendMessage');

  const ref = admin
    .firestore()
    .collection(Schema.ORGANIZATIONS)
    .doc(organizationId)
    .collection(Schema.CHAT_SESSIONS)
    .doc(sessionToken);

  const user: ChatMessage = {
    user: sessionToken,
    content: message,
    date: admin.firestore.FieldValue.serverTimestamp() as any,
  };

  try {
    console.log(userVariables);

    console.log(`server -> Session variables: ${JSON.stringify(userVariables)}`);
    userVariables = userVariables ? parseRiveInternals(mapInputToObject(userVariables)) : {};
    console.log(`server -> Session variables mapped to objects: ${JSON.stringify(userVariables)}`);

    await getSessionManager().setAll(sessionToken, userVariables);
    console.log(`server -> Session variables set to session`);

    console.log(`server -> calling bot`);
    const botAnswer: string = await getBotBackend().answer(organizationId, sessionToken, message);

    console.log(`Bot answer: ${botAnswer}`);

    let newVariables = await getSessionManager().getAny(sessionToken);
    newVariables = newVariables ? mapObjectToOutput(stringifyRiveInternals(newVariables)) : newVariables;

    console.log(`Reading new session variables: ${JSON.stringify(newVariables)}`);

    const bot: ChatMessage = {
      user: DEFAULT_BOT_NAME,
      content: botAnswer,
      date: admin.firestore.FieldValue.serverTimestamp() as any,
    };

    const messagePair: ChatMessageResponse = {
      user,
      bot,
      userVariables: newVariables,
    };

    console.log(`Saving the message pair: ${JSON.stringify(messagePair)}`);

    const chatSessionDoc = await ref.collection(Schema.CHAT_MESSAGES).add(messagePair);

    messagePair.user.id = chatSessionDoc.id + USER_SUFFIX;
    messagePair.user.date = new Date().getTime();
    messagePair.bot.id = chatSessionDoc.id + BOT_SUFFIX;
    messagePair.bot.date = new Date().getTime();

    console.log(`Sending the message pair as a response: ${JSON.stringify(messagePair)}`);

    return messagePair;
  } catch (error) {
    console.error(`GraphQL.sendMessage: ${error}`);
    throw error;
  }
}
