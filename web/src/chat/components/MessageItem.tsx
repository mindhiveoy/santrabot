import { ChatButtonArgs } from '@shared/bot/intepreter';
import { ChatConfiguration, ChatMessage } from '@shared/schema';
import { ChatButtonMessageHandler } from 'chat';
import moment from 'moment';
import * as React from 'react';
import styled from 'styled-components';
import theme from 'theme';

export interface MessageItemProps {
  me: boolean;
  item: ChatMessage;
  configuration: ChatConfiguration;
  onChatButtonMessage: ChatButtonMessageHandler;
}

const ErrorDiv = styled.button`
  background-color: red;
  color: white;
  padding: 1rem;
`;

const StyledButton = styled.button`
  padding: 12px;
  margin-top: 12px;
  margin-bottom: 12px;
`;

const MessageItemDiv = styled.div<Partial<MessageItemProps>>`
  border-radius: ${props => (props.configuration && props.configuration.bubbleBorderRadius) || 8}px;
  align-self: ${props => (props.me ? 'flex-end' : 'flex-start')};
  background-color: ${props =>
    props.me
      ? props.configuration
        ? props.configuration.user.background
        : theme.bubbleMe.backgroundColor
      : props.configuration
      ? props.configuration.bot.background
      : theme.bubbleBot.backgroundColor};
  margin-left: ${props => props.me && '20%'};
  max-width: 80%;
  text-align: ${props => (props.me ? 'right' : 'left')};
`;

const MessageContent = styled.div<Partial<MessageItemProps>>`
  color: ${props =>
    props.me
      ? props.configuration
        ? props.configuration.user.color
        : theme.bubbleMe.color
      : props.configuration
      ? props.configuration.bot.color
      : theme.bubbleBot.color};
  margin: ${props =>
    props.me
      ? (props.configuration && props.configuration.user.margin) || 4
      : (props.configuration && props.configuration.bot.margin) || 4}px;
  padding: ${props =>
    props.me
      ? props.configuration!.user.padding || theme.bubbleMe.padding
      : props.configuration!.bot.padding || theme.bubbleBot.padding}px;
  word-break: normal;
  word-wrap: break-word;
`;

const MessageDate = styled.div<Partial<MessageItemProps>>`
  color: ${props =>
    props.me ? props.configuration!.user.dateColor || 'lightgray' : props.configuration!.bot.dateColor || 'lightgray'};
  font-size: 9px;
  margin: ${props => (props.me ? props.configuration!.user.margin || 4 : props.configuration!.bot.margin || 4)}px;
  padding-left: ${props =>
    props.me
      ? props.configuration!.user.padding || theme.bubbleMe.padding
      : props.configuration!.bot.padding || theme.bubbleBot.padding}px;
  padding-right: ${props =>
    props.me
      ? props.configuration!.user.padding || theme.bubbleMe.padding
      : props.configuration!.bot.padding || theme.bubbleBot.padding}px;

  padding-top: 2px;
  padding-top: ${props =>
    props.me
      ? (props.configuration && props.configuration.user.padding) || 2
      : (props.configuration && props.configuration.bot.padding) || 2}px;
  padding-bottom: 2px;
`;

export default class MessageItem extends React.PureComponent<MessageItemProps> {
  private content: React.ReactNode;

  private dateString: string;

  constructor(props: MessageItemProps) {
    super(props);

    this.dateString = this.formatDate(props.item.date);
    this.content = this.parseContent(props.item.content);
  }
  public render() {
    const { configuration, item, me } = this.props;

    return (
      <MessageItemDiv key={item.id} me={me} configuration={configuration}>
        <MessageContent me={me} configuration={configuration}>
          {this.content}
        </MessageContent>
        <MessageDate me={me} configuration={configuration}>
          {this.dateString}
        </MessageDate>
      </MessageItemDiv>
    );
  }

  private formatDate = (date: number) => {
    return moment(date).format('D.M.YYYY hh:mm:ss');
  }

  private parseContent = (rawContent: string): React.ReactNode => {
    const splits = rawContent.split(/\[\[\[BUTTON(.*?)\]\]\]/);

    const result: React.ReactNode[] = [];
    splits.forEach((item, index) => {
      if (item.startsWith('T4GL1NE')) {
        try {
          // this is a button
          const json = item.substring(8);
          const args = JSON.parse(json) as ChatButtonArgs;
          result.push(
            <StyledButton key={index} onClick={this.handleButtonClick(args.topic, args.message)}>
              {args.title}
            </StyledButton>,
          );
        } catch (error) {
          result.push(<ErrorDiv>{error}</ErrorDiv>);
        }
      } else {
        result.push(<div key={index} dangerouslySetInnerHTML={{ __html: item }} />);
      }
    });
    return result;
  }

  private handleButtonClick = (topic: string, message?: string) => () => {
    const { onChatButtonMessage } = this.props;
    onChatButtonMessage && onChatButtonMessage(topic, message);
  }
}
