import * as React from 'react';
import * as ReactDOM from 'react-dom';

import ServerRoot from 'dashboard/ServerRoot';

console.log(`Running in ${CONFIG.build.environment}`);

const renderMethod = CONFIG.build.environment === 'development' ? ReactDOM.render : ReactDOM.hydrate;

renderMethod(<ServerRoot />, document.getElementById('root') as HTMLElement);
