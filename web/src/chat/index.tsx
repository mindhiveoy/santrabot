import { ChatConfiguration, ChatMessage, ChatMessagePair } from '@shared/schema';
import * as React from 'react';
import styled from 'styled-components';

import { isMobileScreen } from 'theme';
import Header from './components/Header';
import Messages from './components/Messages';
import NewMessageBox from './components/NewMessageBox';

export const CHAT_WIDTH: number = 400;

export enum ChatSessionState {
  /**
   * Chat is been initialized. Chat will make a call to back end to start a new session
   */
  INITIALIZING = 'initializing',
  /**
   * Chat is ready to start with chat instructions
   */
  READY = 'ready',
  /**
   * Chat is active
   */
  ACTIVE = 'active',
  /**
   * Chat has been closed
   */
  CLOSED = 'closed',
}

export type ChatSessionStateListener = (newState: ChatSessionState) => void;

export type ChatButtonMessageHandler = (topic: string, message?: string) => void;

export interface ChatSessionHandler {
  /**
   * Current session state
   *
   * @returns {ChatSessionState}
   * @memberof ChatSessionHandler
   */
  getSessionState(): ChatSessionState;

  /**
   * Unique session token. Session token is used as an user name with anonymous sessions.
   *
   * @returns {string}
   * @memberof ChatSessionHandler
   */
  getSessionToken(): string;

  /**
   * Triggered when user writes a new message
   *
   * @param {string} message The user input written on chat or selected by clicking a button on chat message
   * @param {string} topic The new topic where to go. This should be set with the button click handler the navigate the bot to new state
   * @returns {Promise<ChatMessagePair>}
   * @memberof ChatSessionHandler
   */
  onUserMessage(message: string, topic?: string): Promise<ChatMessagePair>;

  /**
   * Add new state change listener
   *
   * @param {ChatSessionStateListener} listener
   * @memberof ChatSessionHandler
   */
  addStateListener(listener: ChatSessionStateListener): void;

  /**
   * Remove state change listener
   *
   * @param {ChatSessionStateListener} listener
   * @memberof ChatSessionHandler
   */
  removeStateListener(listener: ChatSessionStateListener): void;
}

export interface ChatContainerProps {
  initialMessages?: ChatMessage[];
  messageHandler: ChatSessionHandler;
  designMode?: boolean;
  configuration?: ChatConfiguration;
  infoTextElement?: JSX.Element;
  headerTextElement?: JSX.Element;
  expandOnMobile: boolean;
}

export const defaultChatConfiguration: ChatConfiguration = {
  user: {
    color: 'black',
    background: 'lightgreen',
    dateColor: '#333',
    margin: 8,
  },
  bot: {
    color: 'black',
    background: 'lightblue',
    dateColor: '#333',
    margin: 8,
  },
  headerBackground: 'blue',
  headerPadding: 8,
  headerColor: 'white',
  color: 'black',
  background: 'white',
  borderRadius: 4,
  bubbleBorderRadius: 4,
  boxShadow: '-10px 0 37px -2px rgba(0, 0, 0, 0.63)',
  margin: 4,
};

const Chat = styled.div<Partial<ChatContainerProps>>`
  position: ${props => (props.designMode ? 'relative' : 'fixed')};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: ${props =>
    props.expandOnMobile && isMobileScreen()
      ? window.innerWidth
      : props.configuration
      ? props.configuration.chatWindowWidth || CHAT_WIDTH
      : CHAT_WIDTH}px;
  right: 0;
  bottom: 0;
  max-height: 100%;
  margin-right: ${props => (props.expandOnMobile && isMobileScreen() ? 0 : 16)}px;
  box-shadow: ${props =>
    props.configuration && props.configuration.boxShadow
      ? props.configuration.boxShadow
      : '-10px 0 37px -2px rgba(0, 0, 0, 0.63)'};
  border-radius: ${props =>
    props.configuration && props.configuration.borderRadius ? props.configuration.borderRadius : 4}px;
  background-color: ${props =>
    props.configuration && props.configuration.background ? props.configuration.background : 'white'};
  z-index: ${props => !props.designMode && 10000};
`;

const GuideText = styled.div<Partial<State>>`
  padding: 16px;
  max-height: ${props => props.minified && 0}px;
  transition: all 0.3s ease-in-out;
`;

interface State {
  chatState: ChatSessionState;
  messages: ChatMessage[];
  minified: boolean;
  /**
   * Client have send a message to back end and it is been
   * processed. In this situation the ui will show bot writing aninimation
   * to mimic chat behavior common from h2h chats.
   */
  botWriting: boolean;
}

export default class ChatContainer extends React.Component<ChatContainerProps, State> {
  public static defaultProps: Partial<ChatContainerProps> = {
    configuration: defaultChatConfiguration,
    expandOnMobile: true,
  };

  constructor(props: ChatContainerProps) {
    super(props);
    this.state = {
      chatState: props.messageHandler.getSessionState(),
      messages: props.initialMessages ? props.initialMessages : [],
      minified: false,
      botWriting: false,
    };

    props.messageHandler.addStateListener(this.handleSessionStateChange);
  }

  public componentWillUnMount() {
    this.props.messageHandler.removeStateListener(this.handleSessionStateChange);
  }

  public render() {
    const { configuration = { headerText: 'Default' } as any, headerTextElement } = this.props;

    return (
      <Chat {...this.props}>
        <Header
          title={
            headerTextElement
              ? headerTextElement
              : configuration.headerText
              ? configuration.headerText
              : 'Santra chatbot'
          }
          open={this.state.minified}
          onToggle={this.handleToggle}
          configuration={configuration}
        />
        {this.renderState()}
      </Chat>
    );
  }

  private renderState = () => {
    const { configuration, messageHandler, infoTextElement } = this.props;

    const { chatState, messages, minified, botWriting } = this.state;

    switch (chatState) {
      case ChatSessionState.INITIALIZING:
        return <div>Santra-Botti käynnistyy...</div>;

      case ChatSessionState.READY: {
        return (
          <>
            {infoTextElement
              ? minified
                ? null
                : infoTextElement
              : configuration &&
                configuration.chatGuideText && (
                  <GuideText
                    key="quite-text"
                    minified={minified}
                    dangerouslySetInnerHTML={{
                      __html: configuration.chatGuideText,
                    }}
                  />
                )}
            <NewMessageBox
              key="new-message-box"
              configuration={configuration}
              onNewMessage={this.handleNewMessage}
              minified={minified}
            />
          </>
        );
      }

      case ChatSessionState.ACTIVE:
        return (
          <>
            <Messages
              key="messages"
              minified={minified}
              configuration={configuration}
              botWriting={botWriting}
              messages={messages}
              userName={messageHandler.getSessionToken()}
              onChatButtonMessage={this.handleChatButtonMessage}
            />
            <NewMessageBox
              key="new-message-box"
              minified={minified}
              configuration={configuration}
              onNewMessage={this.handleNewMessage}
            />
          </>
        );

      case ChatSessionState.CLOSED:
        return <div>Session on päättynyt</div>;

      default:
        console.error(`Unidentified chat session state: ${chatState}`);
        return <div>Invalid state</div>;
    }
  }

  private handleSessionStateChange = (chatState: ChatSessionState) => {
    this.setState({
      chatState,
    });
  }

  private handleToggle = (minified: boolean) => {
    this.setState({
      minified,
    });
  }

  private handleChatButtonMessage = async (topic: string, message?: string) => {
    await this.handleBotMessage(message || '', topic);
  }

  private handleNewMessage = async (message: string) => {
    const messageHandler = this.props.messageHandler;
    if (!messageHandler) {
      // TODO error handling
      return;
    }

    const messages = this.state.messages.slice();
    const userMessage: ChatMessage = {
      id: '' + Math.random() * 100000,
      content: message,
      user: messageHandler.getSessionToken(),
      date: Date.now(),
    };
    messages.push(userMessage);

    this.setState({
      botWriting: true,
      messages,
    });

    await this.handleBotMessage(message);
  }

  private handleBotMessage = async (message: string, topic?: string) => {
    const messageHandler = this.props.messageHandler;
    try {
      const pair = await messageHandler.onUserMessage(message, topic);

      const messages = this.state.messages.slice();

      const botMessage = pair.bot;
      messages.push(botMessage);

      this.setState({
        botWriting: false,
        messages,
      });
    } catch (error) {
      this.setState({
        botWriting: false,
      });
      console.error(error);
    }
  }
}
