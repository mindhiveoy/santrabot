import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import * as React from 'react';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router';
import theme from 'theme';

import App from './App';
import store from './reduxStore';

export default class ServerRoot extends React.Component {
  public render() {
    return (
      <MuiThemeProvider theme={theme}>
        <Provider store={store}>
          <StaticRouter>
            <App />
          </StaticRouter>
        </Provider>
      </MuiThemeProvider>
    );
  }
}
