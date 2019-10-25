import { WithTheme, withTheme } from '@material-ui/core';
import * as React from 'react';
import styled from 'styled-components';
import { drawerWidth } from 'theme';

const MainArea = styled(
  ({
    drawerOpen,
    small,
    theme,
    noPadding,
    children,
    ...rest
  }: Partial<ScreenMainProps> & { children?: React.ReactNode }) => <main {...rest}>{children}</main>,
)`
  display: fixed;
  flex-grow: 1;
  background-color: ${props => props.theme.palette.background.default};
  padding-left: ${props => (props.noPadding ? 0 : props.theme.spacing(3))}px;
  padding-right: ${props => (props.noPadding ? 0 : props.theme.spacing(3))}px;
  padding-bottom: ${props => (props.noPadding ? 0 : props.theme.spacing(3))}px;
  padding-top: ${props => (props.noPadding ? 64 : props.theme.spacing(3) + 64)}px;
  overflow-y: scroll;
  height: 100vh;
  transition: margin-left 0.3s;
  margin-left: ${props => (props.drawerOpen && !props.small ? drawerWidth : 0)}px;
`;

export interface ScreenMainProps extends WithTheme {
  drawerOpen?: boolean;
  noPadding?: boolean;
  small?: boolean;
}

class ScreenMain extends React.PureComponent<ScreenMainProps> {
  public render() {
    return <MainArea {...this.props}>{this.props.children}</MainArea>;
  }
}

export default withTheme(ScreenMain);
