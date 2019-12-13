import React from "react";
import firebase, { auth } from "../constants/firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faUndo } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Helmet from "react-helmet";

class Tracker extends React.Component {
  state = {
    email: "",
    password: "",
    user: null,
    items: [],
    error: null,
    itemsToManage: [],
    loading: false,
    success: false,
    selectAll: false
  };

  async componentDidMount() {
    await auth.onAuthStateChanged(user => {
      if (user) {
        this.setState({ user });
        this.getItems();
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
    this.setState({
      loading: true,
      error: null
    });
    const { email, password } = this.state;
    await auth
      .signInWithEmailAndPassword(email, password)
      .then(success => {
        const { user } = success;
        this.setState({
          loading: false,
          user,
          email: "",
          password: ""
        });
        this.getItems();
      })
      .catch(err => {
        const error = err.message;
        this.setState({
          loading: false,
          error
        });
      });
  };

  getItems = async () => {
    const dbRef = firebase.database().ref("/");
    dbRef.once("value", snapshot => {
      const items = [];
      const data = snapshot.val();
      for (let key in data) {
        items.push({
          key: key,
          ...data[key]
        });
      }
      this.setState({
        items
      });
    });
  };

  handleCheck = e => {
    const { itemsToManage } = this.state;
    const key = e.target.name;
    if (itemsToManage.indexOf(key) === -1) {
      itemsToManage.push(key);
    } else {
      const index = itemsToManage.indexOf(key);
      itemsToManage.splice(index, 1);
    }
    this.setState({
      itemsToManage
    });
  };

  selectAll = e => {
    e.preventDefault();
    const { items } = this.state;
    const itemsToManage = [];
    items.forEach(item => {
      itemsToManage.push(item.key);
    });
    this.setState({
      itemsToManage,
      selectAll: true
    });
  };

  deselectAll = e => {
    e.preventDefault();
    this.setState({
      itemsToManage: [],
      selectAll: false
    });
  };

  undoChanges = async e => {
    e.preventDefault();
    const { items, itemsToManage } = this.state;
  };

  deleteLogs = async e => {
    e.preventDefault();
    this.setState({
      loading: true,
      success: false
    });
    const { itemsToManage, items } = this.state;
    const dbRef = firebase.database().ref("/");
    await itemsToManage.forEach(async item => {
      await dbRef.child(item).once("value", () => {
        dbRef.child(item).remove();
      });
      const index = items.findIndex(x => x.key === item);
      items.splice(index, 1);
    });
    this.setState({
      items,
      itemsToManage: [],
      loading: false,
      success: true
    });
  };

  render() {
    return (
      <div className="tracker">
        {!this.state.user ? (
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
        ) : (
          <>
            <Helmet>
              <title>Change Tracker: Name Changer</title>
            </Helmet>
            <h1>Tracker</h1>
            <fieldset aria-busy={this.state.loading}>
              {this.state.success && <p>Changes successfully made.</p>}
              <div className="management">
                <div>
                  {!this.state.selectAll ? (
                    <button onClick={this.selectAll}>Select All</button>
                  ) : (
                    <button onClick={this.deselectAll}>Deselect All</button>
                  )}
                  <button>
                    <FontAwesomeIcon icon={faUndo} /> Undo
                  </button>
                </div>
                <div>
                  <button>
                    <FontAwesomeIcon icon={faTrash} /> Delete
                  </button>
                </div>
              </div>
              <div className="changed-items">
                {this.state.items.map(item => (
                  <div className="item" key={item.key}>
                    <p>
                      <span>Course:</span> {item.courseName}
                    </p>
                    <p>
                      <span className="old">Old Item Title:</span>{" "}
                      {item.oldTitle}
                    </p>
                    <p>
                      <span className="new">New Item Title:</span>{" "}
                      {item.newTitle}
                    </p>
                    <input
                      type="checkbox"
                      name={item.key}
                      onChange={this.handleCheck}
                      className="checkbox"
                      checked={
                        this.state.itemsToManage.indexOf(item.key) !== -1
                      }
                    />
                  </div>
                ))}
              </div>
            </fieldset>
          </>
        )}
      </div>
    );
  }
}

export default Tracker;
