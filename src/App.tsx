import React from 'react';
import ReactIndexedDB from 'react-indexed-db';
import { DBConfig } from './lib/DBConfig';
import Home from './pages/Home';
import './styles.scss';

ReactIndexedDB.initDB(DBConfig); // Initialise the database across all the different components of the app.
// The contents of the search box stored in state.

function App() {
  return <Home />;
}

export default App;
