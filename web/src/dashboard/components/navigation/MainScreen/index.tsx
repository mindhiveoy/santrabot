import { Divider, List, SwipeableDrawer, Theme, WithTheme, withTheme, withWidth } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import FormControl from '@material-ui/core/FormControl';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import NativeSelect from '@material-ui/core/NativeSelect';
import Toolbar from '@material-ui/core/Toolbar';
import { isWidthDown, WithWidth } from '@material-ui/core/withWidth';
import AccountCircle from '@material-ui/icons/AccountCircle';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import MenuIcon from '@material-ui/icons/Menu';
import { User } from '@shared/schema';
import BreadCrumbs, { BreadcrumbStep } from 'dashboard/components/BreadCrumbs';
import { ApplicationState } from 'dashboard/reducers';
import { drawerStateChanged, drawerToggle } from 'dashboard/reducers/navi/naviActions';
import firebaseApp from 'firebaseApp';
import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { drawerWidth } from 'theme';
import { NAVIGATION_PATH } from 'utils/paths';
import { getPageName } from 'utils/routerUtils';

import { createStyles, withStyles } from '@material-ui/styles';
import ScreenMain from './ScreenMain';

export enum DrawerItemVariant {
  ACTION = 'a',
  DIVIDER = 'd',
}

export interface DrawerActionItem {
  variant: DrawerItemVariant.ACTION;
  title: string;
  icon: JSX.Element;
  badge?: number;
  page: NAVIGATION_PATH | string;
}

export interface DrawerDivider {
  variant: DrawerItemVariant.DIVIDER;
}

export type DrawerItem = DrawerActionItem | DrawerDivider;

const BootstrapInput = withStyles((theme: Theme) =>
  createStyles({
    root: {
      'label + &': {
        marginTop: theme.spacing(3),
      },
    },
    input: {
      borderRadius: 4,
      position: 'relative',
      backgroundColor: theme.palette.background.paper,
      // border: '1px solid #ced4da',
      fontSize: 16,
      padding: '10px 26px 10px 12px',
      transition: theme.transitions.create(['border-color', 'box-shadow']),
      // Use the system font instead of the default Roboto font.
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
      '&:focus': {
        borderRadius: 4,
        borderColor: '#80bdff',
        boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
      },
    },
  }),
)(InputBase);

const ScreenContainer = styled.div`
  width: '100%';
`;

const ApplicationBar = styled(({ drawerOpen, theme, children, ...props }) => <AppBar {...props}>{children}</AppBar>)`
  z-index: ${props => props.theme.zIndex.drawer + 1};
  transition: width ${props => props.theme.transitions.duration.leavingScreen}s
    ${props => props.theme.transitions.easing.sharp};
  margin: ${props => props.theme.transitions.duration.leavingScreen}s ${props => props.theme.transitions.easing.sharp};
  margin-left: ${props => (props.drawerOpen ? drawerWidth : 0)}px;
`;

const StyledToolbar = styled(({ drawerOpen, small, theme, children, ...props }) => (
  <Toolbar {...props}>{children}</Toolbar>
))`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 8px;
  ${props => props.theme.mixins.toolbar}
  transition: margin-left 0.3s;
  margin-left: ${props => (props.drawerOpen && !props.small ? drawerWidth : 0)}px;
`;

const MenuButton = styled(({ open, children, ...props }) => <IconButton {...props}>{children}</IconButton>)`
  margin-right: 36;
  transition: all 0.3s;
  ${props =>
    props.open
      ? css`
          max-width: 0;
          margin-left: 0;
          margin-right: 0;
          padding: 0;
          overflow: hidden;
        `
      : css`
          margin-left: 12px;
        `}
`;

const AppBarLeftButtons = styled(({ drawerOpen, children, ...props }) => <div {...props}>{children}</div>)`
  display: flex;
  flex: 1;
  margin-left: ${props => props.drawerOpen && '16px'};
  align-items: center;
`;

const AppBarRightButtons = styled.div`
  display: flex;
`;

const StyledDrawer = styled<any>(SwipeableDrawer)`
  width: ${drawerWidth}px;
  flex-shrink: 0;
`;

const DrawerHeader = styled(({ theme, children, ...props }) => <div {...props}>{children}</div>)`
  display: flex;
  align-items: center;
  padding: 0 8px;
  width: ${drawerWidth}px;
  ${props => props.theme.mixins.toolbar}
  justify-content: flex-end;
`;

export interface MainScreenProps extends DispatchProp<any>, RouteComponentProps<any>, WithTheme, WithWidth {
  /**
   * Breadcrumb items
   */
  leftButtons?: JSX.Element;
  rightButtons?: JSX.Element;

  breadCrumbs?: BreadcrumbStep[];
  appUser?: User;
  noPadding?: boolean;

  drawerOpen: boolean;
  drawerItems?: DrawerItem[];
}

interface State {
  anchorEl?: any | null;
}

class MainScreen extends React.Component<MainScreenProps, State> {
  public static defaultProps: Partial<MainScreenProps> = {
    noPadding: false,
  };

  public state: State = {
    anchorEl: null,
  };

  public render() {
    const { children, drawerOpen = false, theme, width, noPadding } = this.props;

    const small = isWidthDown('sm', width);

    return (
      <ScreenContainer>
        <ApplicationBar theme={theme} position="absolute" drawerOpen={drawerOpen}>
          {this.renderToolbar(small)}
        </ApplicationBar>
        {this.renderDesktopMenu()}
        {this.renderDrawer(theme, drawerOpen, small)}
        <ScreenMain small={small} drawerOpen={drawerOpen} noPadding={noPadding}>
          {children}
        </ScreenMain>
      </ScreenContainer>
    );
  }

  private renderDesktopMenu = () => {
    const { anchorEl } = this.state;
    const { appUser } = this.props;
    const isMenuOpen = Boolean(anchorEl);
    return (
      <Menu
        anchorEl={this.state.anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={isMenuOpen}
        onClose={this.handleMenuClose}
      >
        <MenuItem disabled>{appUser && appUser.email}</MenuItem>
        <MenuItem onClick={this.handleLogOut}>Kirjaudu ulos</MenuItem>
      </Menu>
    );
  }

  private toggleDrawer = () => {
    this.props.dispatch(drawerToggle());
  }

  private handleDrawerChange = (status: boolean) => () => {
    const { dispatch } = this.props;
    dispatch(drawerStateChanged(status));
  }

  private handleLogOut = async () => {
    this.handleMenuClose();
    try {
      await firebaseApp.auth().signOut();
    } catch (error) {
      console.error(error);
    }
  }

  private handleMenuClose = () => {
    this.setState({ anchorEl: null });
  }

  private handleProfileMenuOpen = (event: any) => {
    this.setState({ anchorEl: event.currentTarget });
  }

  private handleOrganizationChange = (event: React.ChangeEvent<any>) => {
    alert(event.target.value);
  }

  private renderDrawer = (theme: Theme, drawerOpen: boolean, small: boolean) => {
    const { drawerItems = [], width } = this.props;
    const currentPage = this.resolveCurrentPage();
    const minified = isWidthDown('xs', width);

    return (
      <StyledDrawer
        variant={small ? 'temporary' : 'persistent'}
        anchor={theme.direction === 'ltr' ? (minified ? 'right' : 'left') : minified ? 'left' : 'right'}
        open={drawerOpen}
        onOpen={this.handleDrawerChange(true)}
        onClose={this.handleDrawerChange(false)}
      >
        <DrawerHeader theme={theme}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'space-between',
            }}
          >
            <FormControl>{this.renderOrganizationPicker()}</FormControl>
            <IconButton onClick={this.toggleDrawer}>
              {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </div>
        </DrawerHeader>
        <Divider />
        <List>
          {drawerItems.map((item, index) => {
            switch (item.variant) {
              case DrawerItemVariant.ACTION:
                return (
                  <ListItem
                    key={index}
                    component={Link}
                    to={item.page}
                    button
                    selected={this.isSelected(item, currentPage)}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.title} />
                  </ListItem>
                );
              case DrawerItemVariant.DIVIDER:
                return <Divider key={index} />;

              default:
                return <div>Error: Unidentified type</div>;
            }
          })}
        </List>
        <Divider />
      </StyledDrawer>
    );
  }

  private renderOrganizationPicker = () => {
    const { appUser } = this.props;
    if (!appUser) {
      return 'Unauthorized';
    }

    const { organizations = {} } = appUser;
    const orgIds = Object.keys(organizations);

    switch (orgIds.length) {
      case 0:
        return 'No organizations';

      case 1:
        return organizations[orgIds[0]].name;

      default:
        return (
          <NativeSelect
            value={'mindhive'}
            onChange={this.handleOrganizationChange}
            input={<BootstrapInput name="org-picker" id="org-picker" />}
          >
            {orgIds.map(id => (
              <option key={id}>{organizations[id].name}</option>
            ))}
          </NativeSelect>
        );
    }
  }
  private isSelected = (item: DrawerActionItem, currentPage: string): boolean => {
    return typeof item.page === 'string'
      ? currentPage !== ''
        ? item.page.endsWith(currentPage)
        : item.page.endsWith('/')
      : item.page === currentPage;
  }

  private resolveCurrentPage = (): NAVIGATION_PATH => {
    return getPageName(this.props.match) as NAVIGATION_PATH;
  }

  private renderToolbar = (small: boolean) => {
    const {
      drawerOpen = false,
      theme,
      breadCrumbs = [],
      appUser,
      leftButtons = null,
      rightButtons = null,
    } = this.props;
    const isMenuOpen = Boolean(this.state.anchorEl);
    const { width } = this.props;

    const minified = isWidthDown('xs', width);

    return (
      <StyledToolbar theme={theme} disableGutters={true} drawerOpen={drawerOpen} small={small}>
        <AppBarLeftButtons drawerOpen>
          {!minified && !drawerOpen && this.renderMenuButton(drawerOpen)}
          {leftButtons}
          <BreadCrumbs minified={minified} steps={breadCrumbs} theme={theme} />
        </AppBarLeftButtons>{' '}
        <AppBarRightButtons>
          {rightButtons}
          {appUser && !minified && (
            <IconButton
              key="profileButton"
              aria-owns={isMenuOpen ? 'material-appbar' : undefined}
              aria-haspopup="true"
              onClick={this.handleProfileMenuOpen}
              color="inherit"
            >
              {appUser.photoURL ? <Avatar alt={appUser.displayName} src={appUser.photoURL} /> : <AccountCircle />}
            </IconButton>
          )}
          {minified && this.renderMenuButton(drawerOpen)}
        </AppBarRightButtons>
      </StyledToolbar>
    );
  }

  private renderMenuButton(drawerOpen: boolean) {
    return (
      <MenuButton open={drawerOpen} color="inherit" aria-label="Open drawer" onClick={this.handleDrawerChange(true)}>
        <MenuIcon />
      </MenuButton>
    );
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: Partial<MainScreenProps>) => {
  return {
    ...ownProps,
    appUser: state.auth.appUser,
    drawerOpen: state.navi.drawerOpen,
    leftButtons: state.navi.leftButtons,
    rightButtons: state.navi.rightButtons,
  };
};

export default withWidth()(withRouter(connect(mapStateToProps)(withTheme(MainScreen))) as any) as any;
