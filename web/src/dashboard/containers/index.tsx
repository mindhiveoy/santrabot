import DomainIcon from '@material-ui/icons/Domain';
import { User } from '@shared/schema';
import { DrawerItemVariant } from 'dashboard/components/navigation/MainScreen';
import { setDrawerItems } from 'dashboard/reducers/navi/naviActions';
import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { AnyAction } from 'redux';

import { ApplicationState } from '../reducers';
import Dashboard from './Dashboard';
import LoginPage from './LoginPage';

export interface RootProps extends DispatchProp<AnyAction> {
  appUser?: User;
}

class Root extends React.PureComponent<RootProps> {
  public componentDidMount() {
    this.props.dispatch(
      setDrawerItems([
        {
          variant: DrawerItemVariant.ACTION,
          title: 'Hallintakonsoli',
          icon: <DomainIcon />,
          page: 'buu',
        },
      ]),
    );
  }
  public render() {
    // The whole Dashboard requires authentication. If authentication is not given,
    // the login screen will be shown.
    const { appUser } = this.props;
    if (!appUser) {
      return <LoginPage />;
    }
    return <Dashboard />;
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: any): RootProps => {
  return {
    ...ownProps,
    appUser: state.auth.appUser,
  };
};

export default connect(mapStateToProps)(Root);
