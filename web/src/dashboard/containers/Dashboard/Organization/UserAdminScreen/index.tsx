import { deepCopy } from '@firebase/util';
import {
  Button,
  Checkbox,
  CircularProgress,
  Input,
  MenuItem,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Theme,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import { green } from '@material-ui/core/colors';
import CheckIcon from '@material-ui/icons/Check';
import {
  Organization,
  Schema,
  ShortUserInfo,
  User,
  UserAdminDeleteOperation,
  UserAdminMessage,
  UserId,
  UserRole,
} from '@shared/schema';
import MainScreen, { DrawerItem } from 'dashboard/components/navigation/MainScreen';
import { ApplicationState } from 'dashboard/reducers';
import { NaviButtons, setNaviButtons } from 'dashboard/reducers/navi/naviActions';
import * as firebase from 'firebase';
import firebaseApp from 'firebaseApp';
import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import styled from 'styled-components';
import { OrganizationRouteParams } from '..';
import NewUsersDialog, { UserForm } from './NewUsersDialog';
import { resolveOperations } from './resolveOperations';

const UserContainer = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  padding-left: 16px;
  padding-right: 16px;
`;

export const ButtonWrapper = styled.div`
  position: relative;
`;

export const CustomCircularProgress = styled<any>(CircularProgress)<any>`
  color: ${green[500]};
  position: absolute;
  top: 50%;
  left: 50%;
  margin-top: -12px;
  margin-left: -12px;
`;

export interface State {
  users: AdminEditorUserInfo[];
  lastSavedUsers: AdminEditorUserInfo[];
  checked: { [userId: string]: boolean };
  modified: boolean;
  dialogOpen: boolean;
  snackbarData: {
    open: boolean;
    msg?: string;
  };
  saving: boolean;
  deleting: boolean;
}

interface UserInfo extends ShortUserInfo {
  role: UserRole;
}

export interface UserAdminProps extends RouteComponentProps<OrganizationRouteParams>, WithStyles, DispatchProp<any> {
  appUser: User;
  drawerItems: DrawerItem[];
}

export interface AdminEditorUserInfo extends ShortUserInfo, RouteComponentProps<OrganizationRouteParams> {
  id?: UserId;
  role: UserRole;
  organizationName?: string;
  pending?: boolean;
}

const updateOrganizationUsers = firebaseApp.functions().httpsCallable('updateOrganizationUsers');

export class UserAdminScreen extends React.Component<UserAdminProps, State> {
  public state = {
    users: [] as AdminEditorUserInfo[],
    lastSavedUsers: [] as AdminEditorUserInfo[],
    checked: {},
    modified: false,
    dialogOpen: false,
    snackbarData: {
      open: false,
      msg: '',
    },
    saving: false,
    deleting: false,
  };

  private usersRef: firebase.firestore.DocumentReference;

  private unsubscribeUsers: () => void;

  public componentDidMount() {
    this.naviButtonStageChange(this.state);

    const {
      match: { params },
    } = this.props;
    this.usersRef = firebaseApp
      .firestore()
      .collection(Schema.ORGANIZATIONS)
      .doc(params.organizationId);

    this.unsubscribeUsers = this.usersRef.onSnapshot(
      (snapshot: firebase.firestore.DocumentSnapshot) => {
        let users: AdminEditorUserInfo[] = [];
        if (snapshot.exists) {
          const organization = snapshot.data() as Organization;
          users =
            organization && organization.users
              ? Object.keys(organization.users).map(userId => {
                  const user = organization.users![userId];
                  return {
                    ...user,
                    id: userId,
                    role: organization.roles![userId] || UserRole.DISABLED,
                  } as AdminEditorUserInfo;
                })
              : [];

          this.setState({
            users,
            lastSavedUsers: deepCopy(users),
          });
        }
      },
      (onError: any) => alert(JSON.stringify(onError)),
    );
  }

  public componentWillUnmount() {
    this.unsubscribeUsers && this.unsubscribeUsers();
  }

  public componentWillUpdate(newProps: UserAdminProps, newState: State) {
    if (this.state !== newState) {
      this.naviButtonStageChange(newState);
    }
  }

  public render() {
    const { users, checked, dialogOpen, snackbarData } = this.state;
    const { drawerItems, location } = this.props;

    return (
      <MainScreen noPadding drawerItems={drawerItems} location={location}>
        <UserContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell variant="head">
                  <b>Valittu</b>
                </TableCell>
                <TableCell variant="head">
                  <b>Nimi</b>
                </TableCell>
                <TableCell variant="head">
                  <b>Sähköposti</b>
                </TableCell>
                <TableCell variant="head">
                  <b>Rooli</b>
                </TableCell>
                <TableCell variant="head">
                  <b>Vahvistettu</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(user => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={user.id || user.email}>
                    <TableCell variant="body" padding="checkbox">
                      <Checkbox
                        checked={checked[this.getUserId(user)] === true}
                        onChange={this.handleCheckedToggle(user)}
                      />
                    </TableCell>
                    <TableCell variant="body" scope="row">
                      {user.displayName}
                    </TableCell>
                    <TableCell variant="body">{user.email}</TableCell>
                    <TableCell variant="body">{this.renderSelector(user)}</TableCell>
                    <TableCell variant="body">{!user.pending && <CheckIcon />}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <NewUsersDialog open={dialogOpen} onCancel={this.handleCloseDialog} onSave={this.handleSaveDialog} />
        </UserContainer>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={snackbarData.open}
          autoHideDuration={3000}
          onClose={this.handleSnackbarClose}
          message={snackbarData.msg}
        />
      </MainScreen>
    );
  }

  private handleCloseDialog = () => {
    this.setState({
      dialogOpen: false,
    });
  }

  private handleSnackbarClose = () => {
    this.setState({
      snackbarData: { open: false },
    });
  }

  private handleSaveDialog = (newUsers: UserForm) => {
    const users = this.state.users.slice();

    newUsers.newUsers.forEach(email => {
      users.push({
        id: undefined,
        displayName: '',
        photoURL: '',
        email,
        role: newUsers.userRole,
      } as any);
    });
    this.setState({
      users,
      modified: true,
    });
    this.handleCloseDialog();
  }

  private getNaviButtons = (state: State): Partial<NaviButtons> => {
    const { modified, checked, saving, deleting } = state;

    let count = 0;
    Object.keys(checked).forEach(key => checked[key] && count++);

    return {
      leftButtons: (
        <>
          <Button key="add" variant="contained" color="primary" onClick={this.handleOpenDialog}>
            Lisää
          </Button>
          <ButtonWrapper>
            <Button
              style={{ marginLeft: '10px' }}
              key="save"
              variant="contained"
              color="primary"
              disabled={saving ? saving : !modified}
              onClick={this.handleSaveClick}
            >
              Tallenna
            </Button>
            {saving && <CustomCircularProgress size={24} />}
          </ButtonWrapper>

          <ButtonWrapper>
            <Button
              style={{ marginLeft: '10px' }}
              key="delete"
              variant="contained"
              color="primary"
              disabled={deleting ? deleting : count === 0}
              onClick={this.handleDeleteClick}
            >
              Poista
            </Button>
            {deleting && <CustomCircularProgress size={24} />}
          </ButtonWrapper>
        </>
      ),
    };
  }

  private naviButtonStageChange = (state: State) => {
    this.props.dispatch(setNaviButtons(this.getNaviButtons(state)));
  }

  private handleOpenDialog = () => {
    this.setState({
      dialogOpen: true,
    });
  }

  private handleSaveClick = async () => {
    const {
      match: { params },
    } = this.props;
    const { users, lastSavedUsers } = this.state;

    this.setState({ saving: true });
    const operations = resolveOperations(users, lastSavedUsers as any);

    const userRecord: UserAdminMessage = {
      oid: params.organizationId,
      operations,
    };

    try {
      await updateOrganizationUsers(userRecord);
      this.setState({ snackbarData: { open: true, msg: 'Muutokset tallennettu!' }, saving: false, modified: false });
    } catch (error) {
      this.setState({ saving: false });
      alert(error);
    }
  }

  private handleDeleteClick = async () => {
    const {
      match: { params },
    } = this.props;
    const { users, checked } = this.state;

    this.setState({ deleting: true });
    const operations: UserAdminDeleteOperation[] = [];

    Object.getOwnPropertyNames(checked).forEach(fieldKey => {
      const user = users.find(item => item.id === fieldKey);
      if (user) {
        operations.push({
          type: 'delete',
          userData: {
            uid: user.pending ? undefined : user.id,
            email: user.email,
          },
        } as UserAdminDeleteOperation);
      }
    });

    const userRecord: UserAdminMessage = {
      operations,
      oid: params.organizationId,
    };
    try {
      await updateOrganizationUsers(userRecord);
      this.setState({ deleting: false, snackbarData: { open: true, msg: 'Käyttäjä(t) poistettu!' } });
    } catch (error) {
      this.setState({ deleting: false });
      alert(error);
    }
  }

  private handleCheckedToggle = (user: AdminEditorUserInfo) => () => {
    const checked = { ...this.state.checked };

    const id = user.id || user.email;
    checked[id] = !checked[id];
    this.setState({
      checked,
    });
  }

  private getUserId = (user: AdminEditorUserInfo): string => {
    return user.id || user.email;
  }

  private renderSelector = (user: AdminEditorUserInfo) => {
    const { appUser } = this.props;

    const fieldId = `${user.id}-role`;

    return user.role === UserRole.PENDING ? (
      'Kutsuttu'
    ) : user.id === appUser.id ? (
      'Sinä'
    ) : (
      <Select
        value={user.role}
        onChange={this.handleSelectChange(user)}
        input={<Input name="role" id="fieldId" />}
        displayEmpty
        name={fieldId}
      >
        <MenuItem value={UserRole.ADMIN}>Ylläpitäjä</MenuItem>
        <MenuItem value={UserRole.USER}>Käyttäjä</MenuItem>
        <MenuItem value={UserRole.CLOSED}>Suljettu</MenuItem>
      </Select>
    );
  }

  private handleSelectChange = (user: UserInfo) => (event: React.ChangeEvent<HTMLSelectElement>) => {
    const index = this.state.users.findIndex(u => u.id === user.id);

    if (index >= 0) {
      const currentUser = this.state.users[index];

      const users = [...this.state.users];
      users.splice(index, 1, {
        ...currentUser,
        role: (event.target.value as any) as UserRole,
      });
      this.setState({
        modified: true,
        users,
      });
    }
  }
}

const style = (theme: Theme) => ({
  cell: {
    padding: '0.5rem',
  },
});

const mapStateToProps = (state: ApplicationState) => {
  return {
    appUser: state.auth.appUser,
    drawerItems: state.navi.drawerItems,
  };
};

export default withRouter(connect(mapStateToProps)(withStyles(style)(UserAdminScreen as any)));
