import { UserAdminAddOperation, UserAdminOperation, UserAdminUpdateOperation } from '@shared/schema';
import { AdminEditorUserInfo } from '.';

export function resolveOperations(
  currentUsers: AdminEditorUserInfo[],
  savedUsers: AdminEditorUserInfo[],
): UserAdminOperation[] {
  const operations: UserAdminOperation[] = [];

  // Add
  currentUsers.forEach(item => {
    if (!item.id) {
      operations.push({ type: 'add', userData: { email: item.email, role: item.role } } as UserAdminAddOperation);
    }
  });

  // Update
  savedUsers.forEach(item => {
    const currentUser = currentUsers.find(user => user.id === item.id);

    if (currentUser && JSON.stringify(currentUser) !== JSON.stringify(item)) {
      const id = currentUser.pending ? undefined : currentUser.id;
      operations.push({
        type: 'update',
        userData: { uid: id, email: currentUser.email, role: currentUser.role },
      } as UserAdminUpdateOperation);
    }
  });

  return operations;
}
