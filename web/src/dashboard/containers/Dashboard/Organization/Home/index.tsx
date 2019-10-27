import MainScreen from 'dashboard/components/navigation/MainScreen';
import { DrawerItem } from 'dashboard/components/navigation/MainScreen/index';
import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { ApplicationState } from '../../../../reducers';

export interface HomeProps extends DispatchProp<any>, RouteComponentProps<any> {
  drawerItems: DrawerItem[];
}

class Home extends React.PureComponent<HomeProps> {
  public render() {
    const { drawerItems, location } = this.props;
    return <MainScreen drawerItems={drawerItems} location={location} />;
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: any) => {
  return {
    ...ownProps,
    drawerItems: state.navi.drawerItems,
  };
};

export default withRouter(connect(mapStateToProps)(Home));
