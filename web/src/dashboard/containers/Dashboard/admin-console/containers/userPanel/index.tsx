import { CircularProgress } from '@material-ui/core';
import { Organization, Schema, User, UserRole } from '@shared/schema';
import Center from 'dashboard/components/Center';
import UserTableView from 'dashboard/components/UserTableView/UserTableView';
import { AdminEditorUserInfo } from 'dashboard/containers/Dashboard/Organization/UserAdminScreen';
import firebaseApp from 'firebaseApp';
import * as React from 'react';

interface UserPanelProps {
  appUser: User;
}

interface State {
  users: AdminEditorUserInfo[];
  loading: boolean;
}

export default class UserPanel extends React.Component<UserPanelProps, State> {
  public state: State = {
    users: [],
    loading: true,
  };

  private unsubscribeUsers: () => void;

  public componentDidMount() {
    const usersRef = firebaseApp.firestore().collection(Schema.ORGANIZATIONS);

    this.unsubscribeUsers = usersRef.onSnapshot(snapshot => {
      let users: AdminEditorUserInfo[] = [];

      snapshot.docs.forEach(item => {
        if (item.exists) {
          const organization = item.data() as Organization;
          users =
            organization && organization.users
              ? Object.keys(organization.users).map(userId => {
                  const user = organization.users![userId];
                  return {
                    ...user,
                    id: userId,
                    organizationName: organization.name,
                    role: organization.roles![userId] || UserRole.DISABLED,
                  } as AdminEditorUserInfo;
                })
              : [];
        }
      });

      this.setState({
        users,
        loading: false,
      });
    });
  }

  public componentWillUnmount() {
    this.unsubscribeUsers && this.unsubscribeUsers();
  }

  public render() {
    const { users, loading } = this.state;

    if (loading) {
      return (
        <Center>
          <CircularProgress />
        </Center>
      );
    }
    return <UserTableView users={users} />;
  }
}
