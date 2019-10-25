/**
 * Defines the React 16 Adapter for Enzyme.
 *
 * @link http://airbnb.io/enzyme/docs/installation/#working-with-react-16
 * @copyright 2017 Airbnb, Inc.
 */
const enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');

enzyme.configure({ adapter: new Adapter() });

global.CONFIG = {
  build: {
    environment: 'test',
  },
  firebase: {
    apiKey: '--',
    authDomain: 'santrabot-test.firebaseapp.com',
    databaseURL: 'https://santrabot-test.firebaseio.com',
    projectId: 'santrabot-test',
    storageBucket: 'santrabot-test.appspot.com',
    messagingSenderId: '123',
  },
};
