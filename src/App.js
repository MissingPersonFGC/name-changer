// TODO: use CTA to explain app usage

import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "./App.css";
import Renamer from "./components/Renamer";
import Tracker from "./components/Tracker";

function App() {
  return (
    <Router>
      <div className="App">
        <Route exact path="/" component={Renamer} />
        <Route path="/tracker" component={Tracker} />
      </div>
    </Router>
  );
}

export default App;
