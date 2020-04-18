// TODO: use CTA to explain app usage

import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "./App.css";
import Renamer from "./components/Renamer";
import Tracker from "./components/Tracker";
import Login from "./components/Login";
import { auth } from "./constants/firebase";

class App extends React.Component {
  state = {
    user: null,
  };
  async componentDidMount() {
    await auth.onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user });
      }
    });
  }
  setUser(user) {
    this.setState({ user });
  }
  render() {
    return (
      <div className="App">
        {this.state.user ? (
          <Router>
            <Route exact path="/" component={Renamer} />
            <Route path="/tracker" component={Tracker} />
          </Router>
        ) : (
          <Login setUser={this.setUser} />
        )}
      </div>
    );
  }
}

export default App;
