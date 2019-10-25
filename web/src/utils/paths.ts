import { match } from 'react-router';

/**
 * # paths
 *
 * Application path navigation definitions and util functions
 *
 * @author Ville Venäläinen - Mindhive Oy
 */

export const enum NAVIGATION_PATH {
  HOME = '',
  ACCOUNT = 'account',
  BOT = 'bot',
  SYSTEM_ADMIN = '_system',
  USER_ADMIN = 'users',
  DASHBOARD = 'dashboard',
  PERSONALIZE = 'personalize',
  LOGS = 'logs',
  EMBED = 'embed',
}

export function getLabelForNavigationPath(path: NAVIGATION_PATH): string {
  switch (path) {
    case NAVIGATION_PATH.BOT:
      return 'Botit';

    case NAVIGATION_PATH.DASHBOARD:
      return 'Hallintapaneeli';

    case NAVIGATION_PATH.EMBED:
      return 'Upotuskoodi';

    case NAVIGATION_PATH.LOGS:
      return 'Logit';

    case NAVIGATION_PATH.PERSONALIZE:
      return 'Personointi';

    case NAVIGATION_PATH.USER_ADMIN:
      return 'Käyttäjähallinta';

    default:
      return `--error--(${path})`;
  }
}
export function verifyEndSlash(url: string): string {
  if (url === '') {
    return '';
  }
  const char = url.charAt(url.length - 1);

  return char === '/' ? url : url + '/';
}

export function removeBeginningSlash(url: string): string {
  if (url === '') {
    return '';
  }
  return url.charAt(0) === '/' ? url.substr(1, url.length) : url;
}

/**
 * Extract the name of file described in the url
 *
 * @param {string} Uri url address
 */
export function extractName(Uri: string): string | undefined {
  if (!Uri) {
    return undefined;
  }
  const index = Uri.lastIndexOf('/');
  if (index < 0) {
    return Uri;
  }
  return Uri.substring(index + 1, Uri.length);
}

/**
 * Extract path form router match object and target
 * @param {*} routerMatch React Router match -object
 * @param {string} target Target resource name
 */
export function extractPath(routerMatch: match<any>, target: string) {
  let url = routerMatch.url;
  url = verifyEndSlash(url);
  target = removeBeginningSlash(target);
  return url + target;
}
