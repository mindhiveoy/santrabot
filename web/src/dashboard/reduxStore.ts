import { ApplicationState } from 'dashboard/reducers';
import { createStore } from 'redux';
import { isDevMode } from 'utils/environment';
import rootReducer, { AppAction } from './reducers';

function configureStore() {
  let enhancer;
  if (isDevMode()) {
    const tools = require('redux-devtools-extension');
    enhancer = tools.composeWithDevTools();
  }
  return createStore<ApplicationState, AppAction, any, any>(rootReducer, enhancer);
}

// pass an optional param to rehydrate state on app start
const store = configureStore();

if (CONFIG.build.environment === 'development') {
  store.subscribe(() => console.log(store.getState()));
}
// Hot Module Replacement API
// declare let module: { hot: any };

/**
 * Dev time hot module replace support
 */
// if (module.hot) {
//   module.hot.accept('reducers', () =>
//     store.replaceReducer(require('reducers').default),
//   );
// }

export default store;
