import getSessionManager from './index';
// import { Script } from '@shared/schema';
import RiveScript from 'rivescript';

import { parseMessage, Token } from './intepreters/chatmessage';
import riveTemplate from './rive_template';

const RIVEINTERNALKEY_INITIAL_MATCH = '__initialmatch__';
const RIVEINTERNALKEY_INITIAL_HISTORY = '__history__';
const RIVEINTERNALKEY_INITIAL_LASTMATCH = '__lastmatch__';
const RIVEINTERNALKEY_INITIAL_LASTTRIGGERS = '__last_triggers__';

const RIVE_STORE_PREFIX = 'RIVE_';

export const RIVE_INTERNAL_KEYS = [
  RIVEINTERNALKEY_INITIAL_MATCH,
  RIVEINTERNALKEY_INITIAL_HISTORY,
  RIVEINTERNALKEY_INITIAL_LASTMATCH,
  RIVEINTERNALKEY_INITIAL_LASTTRIGGERS,
];

export const RIVE_START_DOCUMENT = 'begin.rive';

export const DEFAULT_SCRIPT_FILE: any = {
  name: RIVE_START_DOCUMENT,
  data: riveTemplate,
};

export const EMPTY_SCRIPT_FILE: any = {
  name: RIVE_START_DOCUMENT,
  data: '',
};

export const scriptFiles = [DEFAULT_SCRIPT_FILE];

const bots = {};

export function getBot(
  organization: string,
  botName: string,
  init: boolean = false,
) {
  const orgBots = bots[organization] || {};
  const bot = init || !orgBots[botName] ? createNewBot() : orgBots[botName];
  orgBots[botName] = bot;
  bots[organization] = orgBots;
  return bot;
}

function createNewBot() {
  const river = new RiveScript({
    utf8: true,
    sessionManager: getSessionManager(),
  });

  river.setSubroutine('button', (rs: RiveScript, args: string[]): string => {
    return parseButton(args);
  });
  return river;
}

export async function botAnswer(
  riveBot: any,
  userName: string,
  message: string,
): Promise<Token[]> {
  try {
    const answer = await riveBot.reply(userName, message);
    return parseMessage(answer);
  } catch (error) {
    // TODO error handling
    return [];
  }
}

export function stringifyRiveInternals<T>(variables: T): T {
  for (const key of RIVE_INTERNAL_KEYS) {
    const value = variables[key];
    if (value) {
      variables[RIVE_STORE_PREFIX + key] = JSON.stringify(value);
      delete variables[key];
    }
  }
  return variables;
}

export function parseRiveInternals<T>(variables: T): T {
  for (const key of RIVE_INTERNAL_KEYS) {
    const value = variables[RIVE_STORE_PREFIX + key];
    if (value) {
      const shortKey = key.substring(RIVE_STORE_PREFIX.length);
      variables[shortKey] = JSON.parse(variables[key]);
      delete variables[key];
    }
  }
  return variables;
}

export interface ChatButtonArgs {
  title: string;

  topic: string;

  message?: string;
}

function parseButton(args: string[]): string {
  const input = {} as ChatButtonArgs;

  for (const arg of args) {
    const keyValue = arg.split('=');
    if (keyValue.length <= 1) {
      return 'ERROR: unexpected input on button: ' + arg;
    }
    const key = keyValue[0];
    let value = keyValue[1];
    if (keyValue.length > 2) {
      for (let i = 2; i < keyValue.length; i++) {
        value += '=' + keyValue[i];
      }
    }
    input[key] = value;
  }

  if (!input.title) {
    return 'ERROR: button have no title set. Please define a tittle attribute for the button.';
  }
  if (!input.topic) {
    return 'ERROR: button have no topic set. Please define a tittle attribute for the button.';
  }

  return `[[[BUTTONT4GL1NE ${JSON.stringify(input)}]]]`;
}
