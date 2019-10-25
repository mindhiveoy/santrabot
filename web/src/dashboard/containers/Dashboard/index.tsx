import { OrganizationId, User } from '@shared/schema';
import { DrawerItem } from 'dashboard/components/navigation/MainScreen';
import LoginPage from 'dashboard/containers/LoginPage';
import { ApplicationState } from 'dashboard/reducers';
import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { Redirect, Route, RouteComponentProps, Switch, withRouter } from 'react-router';
import { AnyAction } from 'redux';
import { NAVIGATION_PATH } from 'utils/paths';
import { resolvePaths } from 'utils/routerUtils';
import AdminConsole from './admin-console';
import Organization from './Organization';

export interface AppLocationParams {
  organizationId: OrganizationId;
}

interface DashboardProps extends DispatchProp<AnyAction>, RouteComponentProps<AppLocationParams> {
  appUser?: User;
  drawerItems: DrawerItem[];
  activeRile: string;
}

class MainLayout extends React.Component<DashboardProps> {
  public render() {
    const { appUser } = this.props;
    if (!appUser) {
      return <LoginPage />;
    }

    return (
      <Switch>
        <Route path={`/${NAVIGATION_PATH.SYSTEM_ADMIN}/`} component={AdminConsole} />
        <Route path="/:organizationId/" component={Organization} />
        <Route component={this.renderDashboard} />
      </Switch>
    );
  }

  // private renderOrganization = () => <OrganizationScreen location={this.props.location} />;

  private renderDashboard = () => {
    const { appUser, match } = this.props;
    if (appUser === undefined) {
      return <LoginPage />;
    }

    if (!appUser.organizations) {
      return this.renderNoOrgazation();
    }

    const organizationNames = Object.keys(appUser.organizations);

    if (organizationNames.length >= 1) {
      // Redirect to first organization on user's list
      // TODO save the info for last organization
      return <Redirect to={resolvePaths(match.path, organizationNames[0])} />;
    }
    return this.renderNoOrgazation();
  };

  // private listRightBarButtons = () => {
  //   if (!this.props.appUser) {
  //     return [];
  //   }
  //   return [
  //     // this.renderCreateBoardButton()
  //   ];
  // };

  // private createBreadCrumbs = () => {
  //   const pathName = getPageName(this.props.match) as NAVIGATION_PATH;

  //   const crumbs = [
  //     {
  //       label: 'Hallintapaneeli',
  //       uri: `/${NAVIGATION_PATH.DASHBOARD}/`,
  //     },
  //   ];

  //   if (pathName !== NAVIGATION_PATH.HOME) {
  //     crumbs.push({
  //       label: getLabelForNavigationPath(pathName),
  //       uri: `/${NAVIGATION_PATH.DASHBOARD}/${pathName}`,
  //     });
  //   }
  //   return crumbs;
  // };

  private renderNoOrgazation() {
    return (
      <div>
        a ei ole vielä liitetty jäseneksi mihinkään organizaatioon.Ole hyvä ja pyydä organizaatiosi ylläpitäjää
        lisäämään sinut käyttäjäksi
      </div>
    );
  }
}

const mapStateToProps = (
  state: ApplicationState,
  ownProps: RouteComponentProps<AppLocationParams> & DashboardProps,
): DashboardProps => {
  return {
    ...ownProps,
    appUser: state.auth.appUser,
    drawerItems: state.navi.drawerItems,
  } as DashboardProps;
};

export default withRouter(connect(mapStateToProps)(MainLayout)) as any;
