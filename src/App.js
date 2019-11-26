// TODO: use CTA to explain app usage

import React from "react";
import axios from "axios";
import Select from "react-select";
import Helmet from "react-helmet";
import CSVReader from "react-csv-reader";
import { CSVLink } from "react-csv";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDoubleDown,
  faSave,
  faDownload
} from "@fortawesome/free-solid-svg-icons";
import "./App.css";
import { delay } from "q";

class App extends React.Component {
  state = {
    newModuleNames: [],
    modules: [],
    courses: [],
    selectedCourse: null,
    apiKey: "",
    success: false,
    csvData: [],
    longNames: [],
    error: null,
    loading: false,
    loadMessage: null
  };

  changeState = e => {
    const { value, name } = e.target;
    this.setState({
      [name]: value
    });
  };

  requestCourses = async e => {
    e.preventDefault();
    await this.setState({
      loading: true
    });
    let { apiKey } = this.state;
    apiKey.replace(" ", "");
    if (apiKey.length > 0) {
      await axios({
        method: "GET",
        url: "/api/courses",
        params: {
          apiKey
        }
      })
        .then(res => {
          const courses = res.data.data;
          this.setState({
            courses,
            loading: false,
            error: null
          });
          if (courses.length === 0) {
            this.setState({
              error: `You do not have any courses to display!`
            });
          }
        })
        .catch(e => {
          console.log(e);
        });
    } else {
      this.setState({
        error: `You did not provide an API key.`,
        loading: false
      });
    }
  };

  pullModules = async e => {
    await this.setState({
      success: false,
      loading: true,
      newModuleNames: []
    });
    const courseId = e.value;
    const { apiKey } = this.state;
    await axios({
      method: "GET",
      url: `/api/modules`,
      params: {
        apiKey,
        courseId
      }
    })
      .then(res => {
        const modules = [];

        const json = res.data.data;

        const resourcesIndex = json.findIndex(
          module => module.name === "Resources"
        );

        if (resourcesIndex !== -1) {
          json.splice(resourcesIndex, 1);
        }

        json.forEach(module => {
          module.items.forEach(item => {
            item.module_name = module.name;
            modules.push(item);
          });
        });

        const csvData = [["Old Name", "Module Name", "New Name"]];

        modules.forEach(module => {
          csvData.push([module.title, module.module_name]);
        });
        this.setState({
          csvData,
          modules,
          selectedCourse: courseId,
          loading: false
        });
      })
      .catch(e => {
        console.log(e);
      });
  };

  parseCSV = async data => {
    const newModuleNames = [];
    let error = false;
    let message = null;
    const longNames = [];

    await this.setState({
      error: null,
      longNames: []
    });

    data.pop();
    const i = data[0].indexOf("New Name");
    const iOld = data[0].indexOf("Old Name");
    const iModule = data[0].indexOf("Module Name");

    data.shift();

    await data.forEach((value, index) => {
      if (i >= 0) {
        const newName = value[i];
        const oldName = value[iOld];
        const moduleName = value[iModule];

        // check the index of the old name in the state
        // if the csv data index is greater than the length of the of new name array, push it.
        // if it is not, splice it to the proper index.

        const oldNameIndex = this.state.modules.findIndex(
          module =>
            module.title === oldName && module.module_name === moduleName
        );
        if (oldNameIndex > newModuleNames.length - 1) {
          newModuleNames.push(newName);
        } else {
          newModuleNames.splice(oldNameIndex, 0, newName);
        }
        // if (oldNameIndex === index - 1) {
        //   newModuleNames.push(newName);
        // } else {
        //   error = true;
        //   message = `The items in your CSV file are not in the same order as the modules. This will cause the new names to be incorrect. Please download the CSV file for this course above, and use this as the template for renaming.`;
        //   this.setState({
        //     error: message,
        //     loading: false
        //   });
        //   return;
        // }
      } else {
        this.setState({
          error: `You do not have a column named "New Name" in your CSV file.`
        });
        return;
      }
    });

    console.log(newModuleNames, this.state.modules);

    if (!error) {
      await newModuleNames.forEach((name, index) => {
        if (name.length > 50 && name.indexOf("Study Guide") < 0) {
          if (
            this.state.modules[index].type === "Assignment" ||
            this.state.modules[index].type === "Quiz" ||
            this.state.modules[index].type === "Discussion"
          ) {
            error = true;
            message = `The following item names are too long. Please shorten them to 50 characters or less:`;
            longNames.push(name);
          }
        }
      });
    }

    if (!error) {
      if (newModuleNames.length !== this.state.modules.length) {
        error = true;
        if (newModuleNames.length > this.state.modules.length) {
          message = `You have more items you want to rename than you have in your course modules.`;
          this.setState({
            error: message,
            longNames: []
          });
          return;
        } else {
          message = `You have less items you want to rename than you have in your course modules.`;
          this.setState({
            error: message,
            longNames: []
          });
          return;
        }
      }
    }

    if (!error && longNames.length === 0) {
      this.setState({
        newModuleNames,
        error: null,
        longNames: []
      });
    } else {
      this.setState({
        error: message,
        longNames
      });
    }
  };

  submitNames = async e => {
    e.preventDefault();
    await this.setState({
      error: false,
      success: false,
      loading: true,
      loadMessage: `Please wait while the items are renamed. This may take 1-2 minutes.`
    });
    let error = false;
    const {
      modules,
      apiKey,
      newModuleNames,
      selectedCourse: courseId
    } = this.state;

    async function putRequest() {
      for (let i = 0; i < modules.length; i++) {
        if (!error) {
          modules[i].new_title = newModuleNames[i];
          console.log(modules[i]);
          if (modules[i].new_title.length > 0) {
            await axios({
              method: "PUT",
              url: encodeURI(`/api/item`),
              data: {
                apiKey,
                newTitle: modules[i].new_title,
                moduleId: modules[i].module_id,
                itemId: modules[i].id,
                courseId
              }
            })
              .then(res => {
                console.log(res);
              })
              .catch(e => {
                console.log(e);
                error = true;
              });
          }
          await delay(1000);
        }
      }
    }
    await putRequest();
    if (!error) {
      this.setState({
        success: true,
        error: null,
        loading: false,
        modules: [],
        newModuleNames: []
      });
    } else {
      this.setState({
        error: `The request did not go through.`,
        loading: false
      });
    }
  };

  render() {
    return (
      <div className="App">
        <Helmet>
          <title>Course Module Name Changer</title>
        </Helmet>
        <h1>Course Module Name Changer</h1>
        <form onSubmit={this.requestCourses}>
          <fieldset aria-busy={this.state.loading}>
            <label htmlFor="apiKey">
              Input your API Key:
              <input
                type="text"
                name="apiKey"
                value={this.state.apiKey}
                onChange={this.changeState}
                disabled={this.state.courses.length > 0}
              />
            </label>
            <button type="submit">
              <FontAwesomeIcon icon={faAngleDoubleDown} /> Get Courses
            </button>
          </fieldset>
        </form>
        {this.state.courses.length > 0 && (
          <Select
            options={this.state.courses.map(course => {
              return {
                value: course.id,
                label: course.course_code
              };
            })}
            onChange={this.pullModules}
          />
        )}
        {this.state.loading && (
          <p>{this.state.loadMessage || `Loading, please wait.`}</p>
        )}
        {this.state.error && (
          <p className="error">
            <span>Error:</span> {this.state.error}
          </p>
        )}
        {this.state.csvData.length === 0 &&
          this.state.apiKey !== "" &&
          this.state.selectedCourse && (
            <p>There are no modules in this course.</p>
          )}
        {this.state.csvData.length > 0 && (
          <p className="csv-download">
            Grab the CSV Data to format here:{" "}
            <CSVLink data={this.state.csvData}>
              <FontAwesomeIcon icon={faDownload} /> Download
            </CSVLink>
          </p>
        )}
        {this.state.modules.length > 0 && (
          <CSVReader
            label="Upload your CSV file with new names:"
            onFileLoaded={this.parseCSV}
            onError={this.handleError}
          />
        )}
        {this.state.longNames.length > 0 && (
          <ul>
            {this.state.longNames.map((name, index) => {
              return (
                <li key={index}>
                  {name} ({name.length} characters)
                </li>
              );
            })}
          </ul>
        )}
        {this.state.modules.length > 0 && this.state.newModuleNames.length < 1 && (
          <div className="course-name-container">
            <div className="grid-header">Old Name</div>
            {this.state.modules.map((module, index) => {
              return <div key={index}>{module.title}</div>;
            })}
          </div>
        )}
        {this.state.success && (
          <p className="success">
            <span>Congratulations:</span> Module names successfully updated!
          </p>
        )}
        {this.state.modules.length > 0 &&
          this.state.newModuleNames.length > 0 &&
          !this.state.loading && (
            <>
              {!this.state.success && (
                <p>
                  Here are the modules. Please confirm that the names match up.
                  If they do not, or there are mistakes in the new name, please
                  edit your CSV file and resubmit it.
                </p>
              )}
              <div className="grid-container">
                <div className="grid-header">Old Name</div>
                <div className="grid-header">New Name</div>
                {this.state.modules.map((module, index) => {
                  return (
                    <React.Fragment key={index}>
                      <div>{module.title}</div>
                      <div>{this.state.newModuleNames[index]}</div>
                    </React.Fragment>
                  );
                })}
              </div>
              <button onClick={this.submitNames}>
                <FontAwesomeIcon icon={faSave} />
                Submit Names
              </button>
            </>
          )}
      </div>
    );
  }
}

export default App;
