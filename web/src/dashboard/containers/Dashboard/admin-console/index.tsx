import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import { withTheme, WithTheme } from '@material-ui/styles';
import { User } from '@shared/schema';
import MainScreen, { DrawerItem } from 'dashboard/components/navigation/MainScreen';
import { ApplicationState } from 'dashboard/reducers';
import { UserOrganizatioInfoWithId } from 'dashboard/reducers/auth/authReducer';
import { setDrawerItems, setNaviButtons } from 'dashboard/reducers/navi/naviActions';
import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import styled from 'styled-components';
import { getOrganizationDrawerItems } from '../Organization';
import OrganizationAdminScreen from './containers/OrganizationAdminScreen';
import UserPanel from './containers/userPanel';

const AdminContainer = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  padding-left: 16px;
  padding-right: 16px;
`;

export interface AdminConsoleProps extends RouteComponentProps<any>, DispatchProp<any>, WithTheme {
  drawerItems: DrawerItem[];
  appUser: User;
  activeRole: string;
  activeOrganization?: UserOrganizatioInfoWithId;
}
interface State {
  tabIndex: number;
}

class AdminConsole extends React.Component<AdminConsoleProps, State> {
  public state: State = {
    tabIndex: 0,
  };

  public componentDidMount() {
    this.props.dispatch && this.props.dispatch(setDrawerItems(getOrganizationDrawerItems(this.props)));
  }

  public render() {
    const { drawerItems, location } = this.props;

    return (
      <MainScreen drawerItems={drawerItems} noPadding location={location}>
        <AdminContainer>
          <Tabs
            value={this.state.tabIndex}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            onChange={this.handleChange}
          >
            <Tab label="Organisaatiot" />
            <Tab label="Käyttäjät" />
          </Tabs>
          {this.renderTab()}
        </AdminContainer>
      </MainScreen>
    );
  }

  private handleChange = (event: React.ChangeEvent<any>, tabIndex: number) => {
    this.setState({
      tabIndex,
    });
  }

  private renderTab() {
    switch (this.state.tabIndex) {
      case 0:
        return <OrganizationAdminScreen />;
      case 1:
        this.props.dispatch && this.props.dispatch(setNaviButtons({ leftButtons: undefined }));
        return <UserPanel appUser={this.props.appUser} />;

      default:
        return <div>Unidentified tab</div>;
    }
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: any) => {
  return {
    ...ownProps,
    drawerItems: state.navi.drawerItems,
    appUser: state.auth.appUser,
    activeRole: state.auth.activeRole,
    activeOrganization: state.auth.activeOrganization,
  };
};

export default withRouter(connect(mapStateToProps)(withTheme(AdminConsole)));
