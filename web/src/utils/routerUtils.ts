import { match } from 'react-router';
import { NAVIGATION_PATH } from 'utils/paths';

/**
 * Set http status code if page is been created on server
 *
 * @param props Current component's props (this will include react router context info)
 */
export function setServerHTTPStatus(props: any, status: number): void {
  const { staticContext } = props;

  if (staticContext) {
    staticContext.status = status;
  }
}

export function redirectToPage(history: any, matchObject: match<any> | undefined, pageName: NAVIGATION_PATH): void {
  const path = matchObject!.url;
  const url = path.substr(0, path.lastIndexOf('/'));
  history.push(`${url}/${pageName}`);
}

export function getPageName(matchObject: match<any> | undefined): string {
  const path = matchObject!.url;
  return path.substr(path.lastIndexOf('/') + 1);
}

/**
 * Concat path elements on path
 */
export function resolvePaths(...pathElement: string[]): string {
  let result = '';

  for (const element of pathElement) {
    if (result !== '') {
      result += '/';
    }
    result += removeEndSlash(element);
  }
  return result;
}

export function removeEndSlash(path: string): string {
  if (!path) {
    return path;
  }
  const result = path.trim();
  if (result[result.length - 1] === '/') {
    return result.substr(0, result.length - 1);
  }
  return result;
}
