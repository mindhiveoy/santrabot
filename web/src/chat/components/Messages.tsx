import * as React from 'react';

import { ChatConfiguration, ChatMessage } from '@shared/schema';
import autoscroll from 'autoscroll-react';
import { ChatButtonMessageHandler } from 'chat';
import Writing from 'dashboard/components/Writing';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import styled from 'styled-components';
import { isMobileScreen } from 'theme';
import MessageItem from './MessageItem';

const MessagesPanel = styled<any>(({ minified, ...props }: any) => <TransitionGroup {...props} />)`
  margin-left: 8px;
  margin-right: 8px;
  display: block;
  overflow-y: scroll;
  max-height: ${props => (props.minified ? '0px' : isMobileScreen() ? '100%' : '400px')};
  transition: all 0.3s ease-in-out;

  .balloon-enter {
    opacity: 0.01;
    transition: all 0.3s ease-out;
    overflow: hidden;
  }

  .balloon-enter.balloon-enter-active {
    opacity: 1;
    overflow: hidden;
    transition: all 500ms ease-in;
  }

  .balloon-leave {
    opacity: 1;
  }

  .balloon-leave.balloon-leave-active {
    opacity: 0.01;
    transition: all 300ms ease-in;
  }
`;

export interface MessagesProps {
  configuration?: ChatConfiguration;
  messages: ChatMessage[];
  userName: string;
  minified: boolean;
  botWriting: boolean;
  onChatButtonMessage: ChatButtonMessageHandler;
}

class Messages extends React.PureComponent<MessagesProps> {
  public render() {
    const { botWriting = false, configuration = {} as any, messages, userName, onChatButtonMessage } = this.props;
    return (
      <MessagesPanel transitionName="balloon" transitionEnterTimeout={500} {...this.props}>
        {messages.map(item => (
          <CSSTransition key={item.id} timeout={500} classNames="balloon">
            <MessageItem
              me={item.user === userName}
              item={item}
              configuration={configuration}
              onChatButtonMessage={onChatButtonMessage}
            />
          </CSSTransition>
        ))}
        <Writing active={botWriting} />
      </MessagesPanel>
    );
  }
}

export default autoscroll(Messages, { isScrolledDownThreshold: 0 });
