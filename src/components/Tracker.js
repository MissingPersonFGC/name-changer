import React from "react";
import { Link } from "react-router-dom";
import firebase, { auth } from "../constants/firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faUndo } from "@fortawesome/free-solid-svg-icons";
import { delay } from "q";
import axios from "axios";
import Helmet from "react-helmet";
import Select from "react-select";

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
    selectAll: false,
    courseSearch: "",
    searchQueries: []
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
      const searchQueries = [];
      for (let key in data) {
        items.push({
          key: key,
          ...data[key]
        });
      }
      items.forEach(item => {
        const index = searchQueries.findIndex(
          query => query.value === item.course
        );
        console.log(index);
        if (index === -1) {
          searchQueries.push({
            label: item.courseName,
            value: item.course
          });
        }
      });
      this.setState({
        items,
        searchQueries
      });
    });
  };

  setSearch = e => {
    const courseSearch = e.value;
    this.setState({
      courseSearch
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
      if (item.course === this.state.courseSearch) {
        itemsToManage.push(item.key);
      }
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
    this.setState({
      loading: true,
      success: false,
      error: null
    });
    let error = null;
    itemsToManage.forEach(async item => {
      if (!error) {
        const index = items.findIndex(x => x.key === item);
        const { oldTitle, apiKey, course, module, item: itemId } = items[index];
        await axios({
          method: "PUT",
          url: encodeURI(`/api/item`),
          data: {
            apiKey,
            newTitle: oldTitle,
            moduleId: module,
            itemId: itemId,
            courseId: course
          }
        })
          .then(res => {
            console.log(res);
          })
          .catch(e => {
            error = true;
            console.log(e);
          });
        await delay(1000);
      }
    });
    if (!error) {
      this.setState({
        success: true,
        loading: false,
        error: null,
        itemsToManage: []
      });
    } else {
      this.setState({
        loading: false,
        error: "The request did not go through."
      });
    }
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
            <Link to="/">{"<< Return to name changer"}</Link>
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
            <Link to="/">{"<< Return to name changer"}</Link>
            <h1>Tracker</h1>
            <fieldset aria-busy={this.state.loading}>
              {this.state.success && <p>Changes successfully made.</p>}
              <Select
                options={this.state.searchQueries}
                onChange={this.setSearch}
              />
              {this.state.courseSearch !== "" && (
                <>
                  <div className="management">
                    <div>
                      {!this.state.selectAll ? (
                        <button onClick={this.selectAll}>Select All</button>
                      ) : (
                        <button onClick={this.deselectAll}>Deselect All</button>
                      )}
                      <button onClick={this.undoChanges}>
                        <FontAwesomeIcon icon={faUndo} /> Undo
                      </button>
                    </div>
                    <div>
                      <button onClick={this.deleteLogs}>
                        <FontAwesomeIcon icon={faTrash} /> Delete
                      </button>
                    </div>
                  </div>
                  <div className="changed-items">
                    {this.state.items.map(item => {
                      if (this.state.courseSearch === item.course) {
                        return (
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
                                this.state.itemsToManage.indexOf(item.key) !==
                                -1
                              }
                            />
                          </div>
                        );
                      }
                    })}
                  </div>
                  <div className="management bottom">
                    <div>
                      {!this.state.selectAll ? (
                        <button onClick={this.selectAll}>Select All</button>
                      ) : (
                        <button onClick={this.deselectAll}>Deselect All</button>
                      )}
                      <button onClick={this.undoChanges}>
                        <FontAwesomeIcon icon={faUndo} /> Undo
                      </button>
                    </div>
                    <div>
                      <button onClick={this.deleteLogs}>
                        <FontAwesomeIcon icon={faTrash} /> Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </fieldset>
          </>
        )}
      </div>
    );
  }
}

export default Tracker;
