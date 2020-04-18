import React from "react";
import Helmet from "react-helmet";
import { auth } from "../constants/firebase";

class Login extends React.Component {
  state = {
    email: "",
    password: "",
    loading: false,
    error: null,
  };

  doLogin = async (e) => {
    e.preventDefault();
    this.setState({
      loading: true,
      error: null,
    });
    const { email, password } = this.state;
    await auth
      .signInWithEmailAndPassword(email, password)
      .then((success) => {
        const { user } = success;
        this.setState({
          loading: false,
          email: "",
          password: "",
        });
        this.props.setUser(user);
      })
      .catch((err) => {
        const error = err.message;
        this.setState({
          loading: false,
          error,
        });
      });
  };

  render() {
    return (
      <>
        <Helmet>
          <title>Login: Name Changer</title>
        </Helmet>
        <h1>Login</h1>
        {this.state.error && <p>{this.state.error}</p>}
        <form onSubmit={this.doLogin} disabled={this.state.loading}>
          <fieldset aria-busy={this.state.loading}>
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
    );
  }
}

export default Login;
