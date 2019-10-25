import { ActionCreator, AnyAction } from 'redux';

export enum ChatSessionActionType {
  CHATSESSION_SET_ACTIVE_SESSION = 'CHATSESSION_SET_ACTIVE_SESSION',
}

export interface SetActiveChatSessionAction extends AnyAction {
  type: ChatSessionActionType.CHATSESSION_SET_ACTIVE_SESSION;
  payload: string;
}

export const setActiveChatSession: ActionCreator<SetActiveChatSessionAction> = (sessionId: string) => ({
  type: ChatSessionActionType.CHATSESSION_SET_ACTIVE_SESSION,
  payload: sessionId,
});

export type ChatSessionAction = AnyAction | SetActiveChatSessionAction;
