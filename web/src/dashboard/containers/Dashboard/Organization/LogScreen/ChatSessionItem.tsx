import { Avatar, ListItem, ListItemText } from '@material-ui/core';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ForumIcon from '@material-ui/icons/Forum';
import { ChatSessionWithId } from '@shared/schema';
import moment from 'moment';
import * as React from 'react';
import styled from 'styled-components';

const StyledChevron = styled<any>(ChevronLeft)`
  opacity: ${props => (props.selected ? 1 : 0)};
  transition: 0.3s ease-in-out;
  transform: rotateZ(180deg);
  margin-right: ${props => (props.selected ? '0' : '16px')};
`;

const HistoryIcon = styled<any>(ForumIcon)`
  transition: 0.3s ease-in-out;
  transform: ${props => (props.selected ? 'rotateZ(-15deg)' : 'rotateZ(0)')};
`;

const StyleListItem = styled<any>(ListItem)`
  transition: 0.3s ease-in-out;
  background-color: ${props => (props.selected ? 'lightgray' : 'transparent')};
`;

const StyledListItemText = styled<any>(ListItemText)`
  padding-left: 16px;
`;
export interface ChatSessionItemProps {
  data: ChatSessionWithId;
  selected: boolean;
  onClick: (chatSessionId: string) => void;
}
export default class ChatSessionItem extends React.PureComponent<ChatSessionItemProps> {
  public render() {
    const {
      data: { id, started },
      selected,
    } = this.props;

    const date = moment.utc((started as any).seconds * 1000).format('DD.MM.YYYY HH:mm:ss');

    return (
      <StyleListItem onClick={this.handleClick} selected={selected}>
        <Avatar>
          <HistoryIcon selected={selected} />
        </Avatar>
        <StyledListItemText primary={id} secondary={date} />
        <StyledChevron selected={selected} />
      </StyleListItem>
    );
  }

  private handleClick = () => {
    this.props.onClick && this.props.onClick(this.props.data.id);
  }
}
