import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

var root = document.querySelector('#root');

if (root == null) {
  // Handle fatal errors in your app.
  throw new Error('Could not find root element');
}

ReactDOM.render(<App />, root);

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://snowpack.dev/concepts/hot-module-replacement
if (import.meta.hot) {
  import.meta.hot.accept();
}
