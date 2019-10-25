import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ListItemAvatar, ListItemSecondaryAction } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem, { ListItemProps } from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { Script } from '@shared/schema';
import * as React from 'react';
import styled from 'styled-components';

const StyledList = styled<any>(List)`
  width: 200px;
  padding: 8px;
`;

const StyleLiteItem = styled<ListItemProps | any>(ListItem)`
  background-color: ${props => (props.selected ? 'lightgray' : 'transparent')};
`;

export interface ScriptContainerProps {
  activeScriptName: string;
  scripts: Script[];
  onScriptClick(script: Script): void;
}

export default class ScriptContainer extends React.PureComponent<ScriptContainerProps> {
  public render() {
    return (
      <StyledList>
        {this.props.scripts.map(script => (
          <StyleLiteItem
            key={script.name}
            selected={this.props.activeScriptName === script.name}
            onClick={this.handleClick(script)}
          >
            <ListItemAvatar>
              <Avatar>
                <FontAwesomeIcon icon="robot" />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={script.name} />
            <ListItemSecondaryAction>
              <IconButton aria-label="Delete">
                <FontAwesomeIcon icon="home" />
              </IconButton>
            </ListItemSecondaryAction>
          </StyleLiteItem>
        ))}
      </StyledList>
    );
  }

  private handleClick = (script: Script) => () => {
    this.props.onScriptClick && this.props.onScriptClick(script);
  };
}
