import { ChatConfiguration } from '@shared/schema';
import * as React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import styled from 'styled-components';

import theme from 'theme';
import { CHAT_WIDTH } from '..';

const PADDING: number = 8;

const InputPanel = styled.div<NewMessageBoxProps>`
  padding: ${props => (props.minified ? 0 : PADDING)}px;
  width: ${CHAT_WIDTH - PADDING * 2};
  max-height: ${props => props.minified && '0px'};
  transition: all 0.3s ease-in-out;
`;

const StyledTextarea = styled(({ minified, ...props }) => <TextareaAutosize {...props} />)`
  display: ${props => (props.minified ? 'none' : 'block')};

  font-size: ${() => theme.input.fontSize};
  border-color: ${() => theme.input.borderColor};
  max-height: ${props => props.minified && '0'};
  border-radius: 4px;
  padding: ${props => (props.minified ? '0' : '4px')};
  resize: none;
  box-sizing: border-box;
  width: 100%;

  &::placeholder {
    color: rgba(0, 0, 0, 0.4);
  }
`;

export interface NewMessageBoxProps {
  configuration?: ChatConfiguration;
  minified: boolean;
  onNewMessage: (message: string) => void;
}

export default class NewMessageBox extends React.PureComponent<NewMessageBoxProps> {
  private textareaRef: any;

  constructor(props: NewMessageBoxProps) {
    super(props);
    this.textareaRef = React.createRef<HTMLTextAreaElement>();
  }

  public render() {
    const { configuration, minified } = this.props;
    return (
      <InputPanel {...this.props}>
        <StyledTextarea
          onKeyDown={this.handleKeyDown}
          inputRef={this.mountRef}
          minified={minified}
          placeholder={
            configuration && configuration.chatInputPlaceHolder
              ? configuration.chatInputPlaceHolder
              : 'Kirjoita viestisi...'
          }
        />
      </InputPanel>
    );
  }

  private mountRef = (r: any) => {
    this.textareaRef = r;
  }

  private handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Todo use event target
    if (event.key === 'Enter') {
      try {
        this.props.onNewMessage(this.textareaRef.value);
      } catch (error) {
        console.error(error);
      }
      this.textareaRef.value = '';
      event.preventDefault();
    }
  }
}
