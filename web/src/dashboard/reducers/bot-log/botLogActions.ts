import { ActionCreator, AnyAction } from 'redux';

export enum BotLogActionType {
  BOTLOG_NEW_LINE = 'BOTLOG_NEW_LINE',

  BOTLOG_CLEAR_LOG = 'BOTLOG_CLEAR_LOG',
}

export enum BotLogType {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface BotLogLine {
  date: number;
  type: BotLogType;
  message: string;
}

export interface NewBotLogLineAction extends AnyAction {
  type: BotLogActionType.BOTLOG_NEW_LINE;
  payload: BotLogLine;
}

export interface ClearBotLogAction extends AnyAction {
  type: BotLogActionType.BOTLOG_CLEAR_LOG;
}

export const info = (message: string) =>
  addNewBotLogLine({
    date: new Date().getTime(),
    message,
    type: BotLogType.INFO,
  });

export const warn = (message: string) =>
  addNewBotLogLine({
    date: new Date().getTime(),
    message,
    type: BotLogType.WARN,
  });

export const error = (message: string) =>
  addNewBotLogLine({
    date: new Date().getTime(),
    message,
    type: BotLogType.ERROR,
  });

export const addNewBotLogLine: ActionCreator<NewBotLogLineAction> = (newLine: BotLogLine) => ({
  type: BotLogActionType.BOTLOG_NEW_LINE,
  payload: newLine,
});

export const clearBotLog: ActionCreator<ClearBotLogAction> = () => ({
  type: BotLogActionType.BOTLOG_CLEAR_LOG,
});

export type BotLogAction = AnyAction | NewBotLogLineAction | ClearBotLogAction;
