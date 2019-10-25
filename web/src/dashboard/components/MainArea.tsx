import { withTheme, WithTheme } from '@material-ui/core';
import * as React from 'react';
import styled from 'styled-components';

const Content = styled(({ theme, noPadding, children, ...props }) => <main {...props}>{children}</main>)`
  flex-grow: 1;
  background-color: ${props => props.theme.palette.background.default};
  padding: ${props => (props.noPadding ? 0 : props.theme.spacing(3))}px;
  overflow-y: scroll;
  transition: margin-left 0.3s;
`;

export interface MainAreaProps extends WithTheme {
  noPadding?: boolean;
}

class MainArea extends React.PureComponent<MainAreaProps> {
  public static defaultProps: Partial<MainAreaProps> = {
    noPadding: false,
  };

  public render() {
    return <Content {...this.props}>{this.props.children}</Content>;
  }
}

export default withTheme(MainArea);
