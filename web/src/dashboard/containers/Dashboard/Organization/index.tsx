import { DocumentSnapshot } from '@firebase/firestore-types';
import { FirebaseError } from '@firebase/util';
import { Typography } from '@material-ui/core';
import AlarmIcon from '@material-ui/icons/Alarm';
import CodeIcon from '@material-ui/icons/Code';
import DashboardIcon from '@material-ui/icons/Dashboard';
import FavoriteIcon from '@material-ui/icons/Favorite';
import PeopleIcon from '@material-ui/icons/People';
import { Organization, OrganizationId, Schema, UserRead, UserRole } from '@shared/schema';
import Center from 'dashboard/components/Center';
import LoadingSpinner from 'dashboard/components/LoadingSpinner';
import { DrawerItemVariant } from 'dashboard/components/navigation/MainScreen';
import LoginPage from 'dashboard/containers/LoginPage';
import { ApplicationState } from 'dashboard/reducers';
import firebaseApp from 'firebaseApp';
import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { Route, RouteComponentProps, Switch, withRouter } from 'react-router-dom';
import { AnyAction } from 'redux';
import { NAVIGATION_PATH } from 'utils/paths';

import { UserOrganizatioInfoWithId } from 'dashboard/reducers/auth/authReducer';
import { setDrawerItems } from 'dashboard/reducers/navi/naviActions';
import { setNaviButtons } from '../../../reducers/navi/naviActions';
import BotScreen from './BotScreen';
import EmbedScreen from './EmbedScreen';
import Home from './Home';
import LogScreen from './LogScreen';
import PersonalizeScreen from './PersonalizeScreen';
import UserAdminScreen from './UserAdminScreen';

export interface OrganizationPanelProps extends RouteComponentProps<OrganizationRouteParams>, DispatchProp<AnyAction> {
  appUser?: UserRead;
  activeRole: string;
}

export interface OrganizationRouteParams {
  organizationId: OrganizationId;
}

enum PanelStatus {
  LOADING,
  FOUND,
  NOT_FOUND,
  UNAUTHORIZED,
  ERROR,
}

interface State {
  status: PanelStatus;
  organization?: Organization;
  errorMessage?: string;
}

class OrganizationScreen extends React.Component<OrganizationPanelProps, State> {
  public state: State = {
    status: PanelStatus.LOADING,
  };

  private unsubscribeOrg: () => void;

  public componentDidMount() {
    const {
      match: { params },
    } = this.props;

    this.unsubscribeOrg = firebaseApp
      .firestore()
      .collection(Schema.ORGANIZATIONS)
      .doc(params.organizationId)
      .onSnapshot(
        this.onOrganizationSnapshot,
        (firebaseError: FirebaseError) => {
          this.setState({
            status: PanelStatus.ERROR,
            errorMessage: `${firebaseError.code}: ${firebaseError.message}`,
          });
        },
        () => {
          this.setState({
            status: PanelStatus.ERROR,
            errorMessage: 'done',
          });
        },
      );

    const items = getOrganizationDrawerItems(this.props);
    this.props.dispatch(setDrawerItems(items));
    this.props.dispatch(setNaviButtons({}));
  }

  public componentWillUnmount() {
    this.unsubscribeOrg && this.unsubscribeOrg();
  }

  public componentDidUpdate(prevProps: OrganizationPanelProps) {
    const { appUser, dispatch } = this.props;

    if (prevProps.appUser !== appUser) {
      dispatch(setDrawerItems(getOrganizationDrawerItems(this.props)));
      dispatch(setNaviButtons({}));
    }
  }

  public render() {
    const { appUser, location } = this.props;

    if (!appUser) {
      return <LoginPage />;
    }
    const { status, errorMessage } = this.state;

    switch (status) {
      case PanelStatus.LOADING:
        return (
          <Center location={location}>
            <LoadingSpinner />
            Ladataan...
          </Center>
        );
      case PanelStatus.NOT_FOUND:
        return <Typography variant="h3">Organisaatiota ei löytynyt</Typography>;

      case PanelStatus.FOUND:
        return (
          <Switch>
            <Route path={`/:organizationId/${NAVIGATION_PATH.BOT}`} component={BotScreen} />
            <Route path={`/:organizationId/${NAVIGATION_PATH.LOGS}`} component={LogScreen} />
            <Route path={`/:organizationId/${NAVIGATION_PATH.EMBED}`} component={EmbedScreen} />
            <Route path={`/:organizationId/${NAVIGATION_PATH.USER_ADMIN}`} component={UserAdminScreen} />
            <Route path={`/:organizationId/${NAVIGATION_PATH.PERSONALIZE}`} component={PersonalizeScreen} />
            <Route component={Home} />
          </Switch>
        );

      case PanelStatus.ERROR:
        return error(errorMessage || 'virhetilanne ilman virheilmoitusta.');

      case PanelStatus.UNAUTHORIZED:
        return error(errorMessage || 'Pääsy estetty');

      default:
        return error(`Sisäinen virhe. Tunnistamaton tila (${status})`);
    }
  }

  private onOrganizationSnapshot = (snapshot: DocumentSnapshot) => {
    if (snapshot.exists) {
      const organization = snapshot.data() as Organization;

      if (!organization) {
        this.setState({
          status: PanelStatus.ERROR,
          errorMessage: 'Organisaatio on tyhjä',
        });
      } else if (!organization.users) {
        this.setState({
          status: PanelStatus.ERROR,
          errorMessage: 'Organisaatiolle ei ole määritetty yhtään käyttäjää',
        });
      } else if (!organization.roles) {
        this.setState({
          status: PanelStatus.ERROR,
          errorMessage: 'Organisaatiolle ei ole määritetty yhtään rooleja',
        });
      } else {
        const { appUser } = this.props;

        if (!appUser) {
          throw new Error('Internal error: no appUser defined.');
        }
        const role = organization.roles[appUser.id] as (UserRole | undefined);

        if (role && [UserRole.ADMIN, UserRole.SYSTEM_ADMIN, UserRole.USER].includes(role)) {
          this.setState({
            status: PanelStatus.FOUND,
            organization,
          });
        } else {
          this.setState({
            status: PanelStatus.UNAUTHORIZED,
            errorMessage: 'Sinulla ei ole käyttöoikeuksia tähän organisaatioon',
          });
        }
      }
    } else {
      this.setState({
        status: PanelStatus.NOT_FOUND,
      });
    }
  };
}

export function getOrganizationDrawerItems(props: any) {
  const {
    appUser,
    match: { params },
    activeRole,
    activeOrganization,
  } = props;

  const organization = activeOrganization
    ? (activeOrganization as UserOrganizatioInfoWithId).id
    : params.organizationId;

  const items = [
    {
      icon: <DashboardIcon />,
      variant: DrawerItemVariant.ACTION,
      hiddenInRoles: [UserRole.USER],
      title: 'Botti',
      page: `/${organization}/${NAVIGATION_PATH.BOT}`,
    },
    {
      icon: <AlarmIcon />,
      variant: DrawerItemVariant.ACTION,
      title: 'Logit',
      page: `/${organization}/${NAVIGATION_PATH.LOGS}`,
    },
    {
      hiddenInRoles: [UserRole.USER],
      variant: DrawerItemVariant.DIVIDER,
    },
    {
      icon: <CodeIcon />,
      variant: DrawerItemVariant.ACTION,
      hiddenInRoles: [UserRole.USER],
      title: 'Upotuskoodi',
      page: `/${organization}/${NAVIGATION_PATH.EMBED}`,
    },
    {
      icon: <FavoriteIcon />,
      variant: DrawerItemVariant.ACTION,
      hiddenInRoles: [UserRole.USER],
      title: 'Personointi',
      page: `/${organization}/${NAVIGATION_PATH.PERSONALIZE}`,
    },
    {
      icon: <PeopleIcon />,
      variant: DrawerItemVariant.ACTION,
      hiddenInRoles: [UserRole.USER],
      title: 'Käyttäjähallinta',
      page: `/${organization}/${NAVIGATION_PATH.USER_ADMIN}`,
    },
  ];

  if (appUser && appUser.systemAdmin) {
    items.push(
      {
        hiddenInRoles: [],
        variant: DrawerItemVariant.DIVIDER,
      },
      {
        icon: <PeopleIcon />,
        variant: DrawerItemVariant.ACTION,
        hiddenInRoles: [],
        title: 'Hallintakonsoli',
        page: `/${NAVIGATION_PATH.SYSTEM_ADMIN}`,
      },
    );
  }

  return items.filter(item => {
    if (item.hiddenInRoles && item.hiddenInRoles.includes(activeRole)) {
      return false;
    }
    return true;
  });
}

function error(message: string) {
  return (
    <>
      <Typography variant="h2">Virhe</Typography>
      <Typography variant="body1">{message}</Typography>
    </>
  );
}

const mapStateToProps = (state: ApplicationState, ownProps: OrganizationPanelProps): OrganizationPanelProps => {
  return {
    ...ownProps,
    appUser: state.auth.appUser,
    activeRole: state.auth.activeRole,
  };
};

export default withRouter(connect(mapStateToProps)(OrganizationScreen));
