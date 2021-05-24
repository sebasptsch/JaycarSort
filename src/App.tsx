import "@fortawesome/fontawesome-free";
import "@fortawesome/fontawesome-free/js/all";
import "bulma";
import React from "react";
import { initDB } from "react-indexed-db";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Nav from "./components/Nav";
import { DBConfig } from "./DBConfig";
import Home from "./Home";
import UploadFile from "./UploadFile";

initDB(DBConfig);

function App() {
  return (
    <>
      <Nav />
      <div className="container">
        <Router>
          <Route path="/new" component={UploadFile} />
          <Route path="/" exact component={Home} />
        </Router>
      </div>
    </>
  );
}

export default App;
