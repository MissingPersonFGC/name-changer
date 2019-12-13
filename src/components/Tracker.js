import React from "react";
import { firebase, auth } from "../constants/firebase";
import axios from "axios";
import Helmet from "react-helmet";

class Tracker extends React.Component {
  state = {
    email: "",
    password: "",
    user: null,
    items: []
  };

  async componentDidMount() {
    await auth.onAuthStateChanged(user => {
      if (user) {
        this.setState({ user });
      }
    });
  }

  changeState = e => {
    const { name, value } = e.target;
    this.setState({
      [name]: value
    });
  };

  doLogin = async e => {
    e.preventDefault();
  };

  getItems = async () => {};

  render() {
    return (
      <div className="tracker">
        {!this.state.user ? (
          <>
            <h1>Login</h1>
            <form onSubmit={this.doLogin}>
              <fieldset>
                <div className="login-container">
                  <div>
                    <input
                      type="email"
                      name="email"
                      value={this.state.email}
                      onChange={this.changeState}
                      placeholder="Email Address"
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      name="password"
                      value={this.state.password}
                      onChange={this.changeState}
                      placeholder="Password"
                    />
                  </div>
                  <div>
                    <button type="submit">Login</button>
                  </div>
                </div>
              </fieldset>
            </form>
          </>
        ) : (
          <h1>Tracker</h1>
        )}
      </div>
    );
  }
}

export default Tracker;
