import { Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import { UserRole } from '@shared/schema';
import { AdminEditorUserInfo } from 'dashboard/containers/Dashboard/Organization/UserAdminScreen';
import * as React from 'react';

interface UserTableViewProps {
  users: AdminEditorUserInfo[];
}

export default class UserTableView extends React.Component<UserTableViewProps> {
  public render() {
    const { users } = this.props;

    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell variant="head">
              <b>Nimi</b>
            </TableCell>
            <TableCell variant="head">
              <b>Sähköposti</b>
            </TableCell>
            <TableCell variant="head">
              <b>Organisaatio</b>
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
                <TableCell variant="body" scope="row">
                  {user.displayName}
                </TableCell>
                <TableCell variant="body">{user.email}</TableCell>
                <TableCell variant="body">{user.organizationName}</TableCell>
                <TableCell variant="body">{this.getRole(user)}</TableCell>
                <TableCell variant="body">{!user.pending && <CheckIcon />}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  }

  private getRole = (user: AdminEditorUserInfo) => {
    switch (user.role) {
      case UserRole.ADMIN:
        return 'Ylläpitäjä';
      case UserRole.USER:
        return 'Käyttäjä';
      case UserRole.CLOSED:
        return 'Suljettu';

      default:
        return '';
    }
  };
}
