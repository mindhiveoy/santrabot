import MainScreen from 'dashboard/components/navigation/MainScreen';
import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { DrawerItem } from '../../../../components/navigation/MainScreen/index';
import { ApplicationState } from '../../../../reducers/index';

export interface HomeProps extends DispatchProp<any> {
  drawerItems: DrawerItem[];
}

class Home extends React.PureComponent<HomeProps> {
  public render() {
    const { drawerItems } = this.props;
    return <MainScreen drawerItems={drawerItems} />;
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: any) => {
  return {
    ...ownProps,
    drawerItems: state.navi.drawerItems,
  };
};

export default connect(mapStateToProps)(Home);
