import getSessionManager from '@shared/bot';
import { getBot, RIVE_INTERNAL_KEYS } from '@shared/bot/intepreter';
import { ChatMessage, ChatMessagePair, DEFAULT_BOT_NAME } from '@shared/schema';
import { info } from 'dashboard/reducers/bot-log/botLogActions';
import resolveChanges, { ChangeType } from 'utils/objectTools';

import { ChatSessionHandler, ChatSessionState, ChatSessionStateListener } from 'chat';
import store from 'dashboard/reduxStore';

export default class DashboardChatMessageHandler implements ChatSessionHandler {
  private stateListeners: Set<ChatSessionStateListener> = new Set();

  private state: ChatSessionState = ChatSessionState.ACTIVE;
  constructor(private organizationId_: string | (() => string)) {}

  private get organizationId(): string {
    if (typeof this.organizationId_ === 'string') {
      return this.organizationId_;
    }
    return this.organizationId_();
  }

  public onUserMessage = (message: string, topic?: string): Promise<ChatMessagePair> => {
    return new Promise<ChatMessagePair>(async (resolve, reject) => {
      const userName = 'user1';

      const user: ChatMessage = {
        id: Math.random() * 1000000 + '_id',
        user: userName,
        content: message,
        date: new Date().getTime(),
      };

      try {
        const session = getSessionManager();

        const variablesBefore = await session.getAny(userName);

        if (topic) {
          await session.set(userName, {
            topic,
          });
        }

        const riveBot = getBot(this.organizationId, DEFAULT_BOT_NAME);
        const answer = await riveBot.reply(userName, message);
        const variablesAfter = await session.getAny(userName);

        const changes = resolveChanges(variablesBefore, variablesAfter);

        for (const key of RIVE_INTERNAL_KEYS) {
          const index = changes.findIndex(change => change.key === key);
          if (index >= 0) {
            const change = changes[index];
            change.oldValue = change.oldValue ? JSON.stringify(change.oldValue) : change.oldValue;
            change.newValue = change.newValue ? JSON.stringify(change.newValue) : change.newValue;
          }
        }

        changes.forEach(change => {
          let line;

          switch (change.type) {
            case ChangeType.ADD:
              line = info(`Uusi muutuja: ${change.key} = ${change.newValue}`);
              break;

            case ChangeType.MODIFY:
              line = info(`Muuttuajan arvo vaihtui: ${change.key} = ${change.newValue} (vanha = ${change.oldValue})`);
              break;

            case ChangeType.DELETE:
              line = info(`Muuttuajan poistettu: ${change.key}. (vanha = ${change.oldValue})`);
              break;

            default:
              console.error(`Unidentified ChangeType: ${change.type}`);
          }
          store.dispatch(line);
        });

        const bot: ChatMessage = {
          id: Math.random() * 1000000 + '_id',
          user: 'bot',
          content: answer,
          date: new Date().getTime(),
        };

        const pair: ChatMessagePair = {
          user,
          bot,
          buttonMessage: topic !== undefined,
        };
        resolve(pair);
      } catch (error) {
        reject(error);
      }
    });
  }

  public getSessionToken(): string {
    return 'user1';
  }

  public getSessionState(): ChatSessionState {
    return this.state;
  }

  public addStateListener(listener: ChatSessionStateListener) {
    this.stateListeners.add(listener);
  }

  public removeStateListener(listener: ChatSessionStateListener) {
    this.stateListeners.delete(listener);
  }
}
