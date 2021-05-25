import '@fortawesome/fontawesome-free';
import '@fortawesome/fontawesome-free/js/all';
import React from 'react';
import { initDB } from 'react-indexed-db';
import Nav from './components/Nav';
import { DBConfig } from './lib/DBConfig';
import Home from './pages/Home';
import './styles.scss';

initDB(DBConfig);

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
