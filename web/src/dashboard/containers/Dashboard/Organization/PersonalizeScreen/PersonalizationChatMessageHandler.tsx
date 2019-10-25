import { ChatMessage, ChatMessagePair } from '@shared/schema';
import { ChatSessionHandler, ChatSessionState, ChatSessionStateListener } from 'chat';

export default class PersonalizationChatMessageHandler implements ChatSessionHandler {
  private stateListeners: Set<ChatSessionStateListener> = new Set();

  private state: ChatSessionState;

  constructor(state: ChatSessionState) {
    this.state = state;
  }

  public onUserMessage = (message: string): Promise<ChatMessagePair> => {
    return new Promise<ChatMessagePair>(async (resolve, reject) => {
      const user: ChatMessage = {
        id: Math.random() * 1000000 + '_id',
        user: 'user1',
        content: message,
        date: new Date().getTime(),
      };

      try {
        // const userName = 'user1';

        const bot: ChatMessage = {
          id: Math.random() * 1000000 + '_id',
          user: 'bot',
          content: 'Vastaus',
          date: new Date().getTime(),
        };

        const pair: ChatMessagePair = {
          user,
          bot,
        };
        resolve(pair);
      } catch (error) {
        reject(error);
      }
    });
  };

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
