import {
  ChatConfiguration,
  ChatMessagePair,
  ChatMessageResponse,
  OrganizationId,
  StartSessionResponse,
  Variable,
} from '@shared/schema';
import * as React from 'react';

import ChatContainer, { ChatSessionHandler, ChatSessionState, ChatSessionStateListener } from 'chat';

import { render } from 'react-dom';
import graphQlCall from 'utils/graphQlClient';

const startSessionMutation = `mutation startSession($organizationId: String!) {
  startSession(organizationId: $organizationId) {
    sessionToken
    userVariables {
      ... {
        key
        value
      }
    }
  }
}`;

const sendMessageMutation = `mutation sendMessage(
  $message: String!
  $sessionToken: String!
  $organizationId: String!
  $userVariables: [UserVariableInput]!
) {
  sendMessage(
    message: $message
    sessionToken: $sessionToken
    organizationId: $organizationId
    userVariables: $userVariables
  ) {
    user {
      id
      content
      date
      user
    }
    bot {
      id
      content
      date
      user
    }
    userVariables {
      ... {
        key
        value
      }
    }
  }
}`;

function cleanVariables(userVariables: Variable[]) {
  const result: any[] = [];

  userVariables.forEach(element => {
    if (element.key.startsWith('RIVE___')) {
      return;
    }
    delete (element as any).__typename;
    result.push(element);
  });
  return result;
}

export class ClientChatSessionHandler implements ChatSessionHandler {
  private sessionToken: string;

  private state: ChatSessionState = ChatSessionState.INITIALIZING;

  private userVariables: Variable[];

  private stateListeners: Set<ChatSessionStateListener> = new Set();

  constructor(public organizationId: OrganizationId, public botName: string) {
    this.startSession()
      .then(() => {
        console.log('session started');
      })
      .catch(error => console.error(error));
  }

  public getSessionState(): ChatSessionState {
    return this.state;
  }

  public getSessionToken(): string {
    return this.sessionToken;
  }

  public onUserMessage = async (message: string): Promise<ChatMessagePair> => {
    const answer: ChatMessageResponse = await this.sendMessage(message);
    this.userVariables = cleanVariables(answer.userVariables);

    return {
      user: answer.user,
      bot: answer.bot,
    };
  }

  public addStateListener(listener: ChatSessionStateListener) {
    this.stateListeners.add(listener);
  }

  public removeStateListener(listener: ChatSessionStateListener) {
    this.stateListeners.delete(listener);
  }

  /**
   * Start new user session
   */
  private startSession = async () => {
    try {
      const response = await graphQlCall(startSessionMutation, {
        organizationId: this.organizationId,
      });

      console.log(response);

      const startSession = response.startSession as StartSessionResponse;
      this.sessionToken = startSession.sessionToken;
      this.userVariables = startSession.userVariables;

      this.userVariables = cleanVariables(this.userVariables);

      this.setState(ChatSessionState.READY);
      // TODO Initial hello
    } catch (error) {
      console.error(error);
    }
  }

  private setState = (newState: ChatSessionState) => {
    this.state = newState;

    this.stateListeners.forEach(listener => listener(this.state));
  }

  /**
   * Send a single chat message to bot and get answer
   */
  private sendMessage = async (message: string): Promise<ChatMessageResponse> => {
    if (this.state === ChatSessionState.READY) {
      this.setState(ChatSessionState.ACTIVE);
    }

    const response = await graphQlCall(sendMessageMutation, {
      message,
      organizationId: this.organizationId,
      sessionToken: this.sessionToken,
      userVariables: cleanVariables(this.userVariables),
    });

    return response.sendMessage;
  }
}

/**
 * Embed chat to target dom
 *
 * @param organizationId
 * @param botName
 */

if (document) {
  const santraConf = (window as any).santra;
  if (!santraConf || !(window as any).santra.q) {
    alert('Virhe: Santrachatbotin ei saatu alustettua oikein.');
  } else {
    const args: string[] = (window as any).santra.q[0];

    if (args.length !== 2) {
      alert('Virhe: Argumentit eivät täsmää.');
    } else {
      const organizationId = args[1];
      const bot = 'santra';

      const url = `https://${CONFIG.firebase.authDomain}/theme/${organizationId}/${bot}/`;
      fetch(url)
        .then(res => res.json())
        .then((configuration: ChatConfiguration) => {
          const messageHandler = new ClientChatSessionHandler(organizationId, 'santra');

          const root = document.createElement('div');
          root.id = 'santra-chat-bot';
          document.getElementsByTagName('body')[0].appendChild(root);

          render(<ChatContainer messageHandler={messageHandler} configuration={configuration} />, root);
        })
        .catch(error => console.error(error));
    }
  }
}
