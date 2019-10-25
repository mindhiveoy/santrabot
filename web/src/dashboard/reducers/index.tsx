import { AnyAction, combineReducers } from 'redux';
import { AuthAction } from './auth/authActions';
import { auth } from './auth/authReducer';
import { BotLogAction } from './bot-log/botLogActions';
import { botLog } from './bot-log/botLogReducer';
import { ChatSessionAction } from './chat-session/chatSessionActions';
import { chat } from './chat-session/chatSessionReducer';
import { NaviAction } from './navi/naviActions';
import { navi } from './navi/naviReducer';

export type AppAction = AnyAction | AuthAction | BotLogAction | ChatSessionAction | NaviAction;

const rootReducer = combineReducers({
  auth,
  botLog,
  chat,
  navi,
});

export type ApplicationState = ReturnType<typeof rootReducer>;

export default rootReducer;
