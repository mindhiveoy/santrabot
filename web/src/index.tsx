import Root from 'dashboard/Root';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import registerServiceWorker from './registerServiceWorker';

console.log(`Running in ${CONFIG.build.environment}`);

const renderMethod = CONFIG.build.environment === 'development' ? ReactDOM.render : ReactDOM.hydrate;

renderMethod(<Root />, document.getElementById('root') as HTMLElement);

registerServiceWorker();
