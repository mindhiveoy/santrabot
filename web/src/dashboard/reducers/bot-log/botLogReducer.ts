import { Reducer } from 'redux';

import { BotLogAction, BotLogActionType, BotLogLine } from './botLogActions';

export interface BotLogState {
  readonly log: BotLogLine[];
}

const defaultState: BotLogState = {
  log: [],
};

export const botLog: Reducer<BotLogState> = (state = defaultState, action: BotLogAction) => {
  switch (action.type) {
    case BotLogActionType.BOTLOG_CLEAR_LOG: {
      return {
        ...state,
        log: [],
      };
    }

    case BotLogActionType.BOTLOG_NEW_LINE: {
      const log = state.log.slice();
      log.push(action.payload);

      return {
        ...state,
        log,
      };
    }
    default:
      return state;
  }
};
