import * as React from 'react';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';

import App from 'dashboard/App';
import store from 'dashboard/reduxStore';
import * as ReactDOMServer from 'react-dom/server';
import theme from 'theme';

import { MuiThemeProvider } from '@material-ui/core/styles';
import { Helmet, HelmetData } from 'react-helmet';
import JssProvider from 'react-jss/lib/JssProvider';
import { ServerStyleSheet } from 'styled-components';
import createSheetsRegistry from './registryFactor';

/**
 * Render server initial state of the app for server side rendering
 *
 * @param context Router context object needed for redirects
 * @param url Starting url agains to render app state
 */
export default function renderer(context: any, url: string) {
  const sheet = new ServerStyleSheet();

  const muiTheme = getMuiTheme();

  const sheetsRegistry = createSheetsRegistry();

  const html = ReactDOMServer.renderToString(
    sheet.collectStyles(
      <JssProvider registry={sheetsRegistry}>
        <MuiThemeProvider theme={muiTheme}>
          <Provider store={store}>
            <StaticRouter location={url} context={context}>
              <App />
            </StaticRouter>
          </Provider>
        </MuiThemeProvider>
      </JssProvider>,
    ),
  );
  const helmet: HelmetData = Helmet.renderStatic();
  const styledTags = sheet.getStyleTags();
  const jssCss = sheetsRegistry.toString();

  return formatHTML(html, helmet, styledTags, jssCss);
}

/**
 * Expose muiTheme to cloud function code.
 */
export function getMuiTheme() {
  return theme;
}

// TODO set default html -tag locate to be configurable
function formatHTML(appStr: string, helmet: HelmetData, styleTags: string, jssCss: string): string {
  return `
    <!DOCTYPE html>
    <html lang="fi">
      <head>
        ${helmet.title.toString()}
        ${helmet.meta.toString()}
        ${helmet.link.toString()}
        ${helmet.style.toString()}
        ${helmet.script.toString()}
        ${styleTags}
      </head>
      <body>
        ${helmet.noscript.toString()}
        <div id="root">
          ${appStr}
        </div>
        <script src="/app.js"></script>
        <style id="jss-server-side">${jssCss}</style>
      </body>
    </html>
  `;
}
