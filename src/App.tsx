import "@fortawesome/fontawesome-free";
import "@fortawesome/fontawesome-free/js/all";
import "bulma";
import React from "react";
import { initDB } from "react-indexed-db";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Nav from "./components/Nav";
import NewFileModal from "./components/NewFileModal";
import { DBConfig } from "./lib/DBConfig";
import Home from "./pages/Home";

initDB(DBConfig);

function App() {
  return (
    <>
      <div className="container">
        <Nav />
        <Router>
          <Route path="/new" component={NewFileModal} />
          <Route path="/" exact component={Home} />
        </Router>
      </div>
    </>
  );
}

export default App;
