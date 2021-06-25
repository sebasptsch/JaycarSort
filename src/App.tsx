import React from 'preact/compat';
import ReactIndexedDB from 'react-indexed-db';
import Footer from './components/Footer';
import Nav from './components/Nav';
import { DBConfig } from './lib/DBConfig';
import Home from './pages/Home';
import './styles.scss';

ReactIndexedDB.initDB(DBConfig); // Initialise the database across all the different components of the app.

function App() {
  return (
    <>
      <Nav />
      <div className="container">
        <Home />
      </div>
      <Footer />
    </>
  );
}

export default App;
