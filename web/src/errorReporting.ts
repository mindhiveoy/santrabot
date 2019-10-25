/**
 * Setup sentry error reporting for staging and production environments
 */

import * as Sentry from '@sentry/browser';

if (CONFIG.build.environment !== 'development') {
  Sentry.init({
    dsn: 'https://b1dba0733afe4f8988b5dda20e5a3e4e@sentry.io/1370389',
    environment: `web-${CONFIG.build.environment}`,
    // version: `${CONFIG.build.version}-${CONFIG.build.build}`,
  });
}
