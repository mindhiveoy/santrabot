import { ChatMessageResponse } from '@shared/schema';
import { defaultChatConfiguration } from 'chat';
import MessageItem from 'chat/components/MessageItem';
import * as React from 'react';

export interface ChatHistoryItemProps {
  item: ChatMessageResponse;
}

export default class ChatHistoryItem extends React.PureComponent<ChatHistoryItemProps> {
  public render() {
    const {
      item: { user, bot },
    } = this.props;
    return (
      <div>
        <MessageItem
          key={user.id}
          me={true}
          item={user}
          configuration={defaultChatConfiguration}
          onChatButtonMessage={this.handleChatButtonMessage}
        />
        <MessageItem
          key={bot.id}
          me={false}
          item={bot}
          configuration={defaultChatConfiguration}
          onChatButtonMessage={this.handleChatButtonMessage}
        />
      </div>
    );
  }

  private handleChatButtonMessage = (topic: string, message?: string) => {
    // no action
  }
}
