import { Reducer } from 'redux';

import { ChatSessionAction, ChatSessionActionType } from './chatSessionActions';

export interface ChatSessionState {
  readonly activeSession?: string;
}

const defaultState: ChatSessionState = {
  activeSession: undefined,
};

export const chat: Reducer<ChatSessionState> = (state = defaultState, action: ChatSessionAction) => {
  if (action.type === ChatSessionActionType.CHATSESSION_SET_ACTIVE_SESSION) {
    return {
      ...state,
      activeSession: action.payload,
    };
  }
  return state;
};
