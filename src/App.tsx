import '@fortawesome/fontawesome-free';
import '@fortawesome/fontawesome-free/js/all';
import React from 'react';
import ReactIndexedDB from 'react-indexed-db';
import Nav from './components/Nav';
import { DBConfig } from './lib/DBConfig';
import Home from './pages/Home';
import './styles.scss';

ReactIndexedDB.initDB(DBConfig);

function App() {
  console.log('helo');
  return (
    <div className="container">
      <Nav />
      <Home />
    </div>
  );
}

export default App;
