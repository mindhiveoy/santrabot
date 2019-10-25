import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import * as React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import theme from 'theme';

import App from './App';
import store from './reduxStore';

export default class Root extends React.Component {
  public render() {
    return (
      <MuiThemeProvider theme={theme}>
        <Provider store={store}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Provider>
      </MuiThemeProvider>
    );
  }
}
