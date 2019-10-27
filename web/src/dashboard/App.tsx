import CssBaseline from '@material-ui/core/CssBaseline';
import * as Sentry from '@sentry/browser';
import { User } from '@shared/schema';
import LoginPage from 'dashboard/containers/LoginPage';
import { ApplicationState } from 'dashboard/reducers';

import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { Redirect, Route, Switch, withRouter } from 'react-router-dom';
import { AnyAction } from 'redux';
import { createGlobalStyle } from 'styled-components';
import { resolvePaths } from 'utils/routerUtils';

import Dashboard from './containers/Dashboard';
import Header from './Header';

const GlobalStyle = createGlobalStyle`
  html: {
    font-size: 62.5%;
  }
  body {
    color: rgb(128, 131, 133);
    font-family: Helvetica, Arial, Verdana, Tahoma, sans-serif;
    font-size: 1.6rem;
    margin: 0;
    padding: 0;
  }
`;

export interface AppProps extends DispatchProp<AnyAction> {
  appUser?: User;
}

class App extends React.Component<AppProps> {
  private unsubscribeUser: () => void;

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error });

    if (CONFIG.build.environment !== 'development') {
      Sentry.withScope(scope => {
        Object.keys(errorInfo).forEach(key => {
          scope.setExtra(key, errorInfo[key]);
        });
        Sentry.captureException(error);
      });
    }
  }

  public componentWillUnmount() {
    this.unsubscribeUser && this.unsubscribeUser();
  }

  public render() {
    const { appUser } = this.props;
    if (!appUser) {
      return <LoginPage />;
    }
    return (
      <>
        <CssBaseline />
        <GlobalStyle />
        {CONFIG.build.environment !== 'development' && <Header />}
        <div
          style={{
            position: 'absolute',
            zIndex: 1000,
            right: 16,
            bottom: 16,
          }}
        >
          {location.pathname}
        </div>

        <Switch>
          <Route path="/:organizationid/" component={Dashboard} />
          <Route component={this.renderDashboard} />
        </Switch>
      </>
    );
  }

  private renderDashboard = () => {
    const { appUser } = this.props;
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
      return <Redirect to={resolvePaths(organizationNames[0])} />;
    }
    return this.renderNoOrgazation();
  }

  private renderNoOrgazation() {
    return (
      <div>
        Sinua ei ole vielä liitetty jäseneksi mihinkään organizaatioon.Ole hyvä ja pyydä organizaatiosi ylläpitäjää
        lisäämään sinut käyttäjäksi
      </div>
    );
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: any) => {
  return {
    ...ownProps,
    appUser: state.auth.appUser,
  };
};

export default withRouter(connect(mapStateToProps)(App));
