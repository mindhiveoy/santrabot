import { OrganizationId, User } from '@shared/schema';
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
  }

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
  } as DashboardProps;
};

export default withRouter(connect(mapStateToProps)(MainLayout)) as any;
