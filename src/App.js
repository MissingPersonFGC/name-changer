// TODO: use CTA to explain app usage
// TODO: see if you can query for only published module items
// TODO: add module titles to items for importing into CSV

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

class App extends React.Component {
  state = {
    newModuleNames: [],
    modules: [],
    courses: [],
    selectedCourse: null,
    apiKey: null,
    success: false,
    csvData: [],
    longNames: [],
    error: null
  };

  changeState = e => {
    const { value, name } = e.target;
    this.setState({
      [name]: value
    });
  };

  requestCourses = async e => {
    e.preventDefault();
    const { apiKey } = this.state;
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
          courses
        });
      })
      .catch(e => {
        console.log(e);
      });
  };

  pullModules = async e => {
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
            // item.module_id = module.id;
            modules.push(item);
          });
        });

        const csvData = [["Old Name", "New Name"]];

        modules.forEach(module => {
          csvData.push([module.title]);
        });
        this.setState({
          csvData,
          modules,
          selectedCourse: courseId
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

    data.pop();

    data.forEach((value, index) => {
      if (index > 0) {
        const newName = value[1];
        newModuleNames.push(newName);
      }
    });

    await newModuleNames.forEach((name, index) => {
      if (name.length > 50) {
        if (
          this.state.modules[index].type === "Assignment" ||
          this.state.modules[index].type === "Quiz" ||
          this.state.modules[index].type === "Test" ||
          this.state.modules[index].type === "Project" ||
          this.state.modules[index].type === "Classwork"
        ) {
          error = true;
          message = `The following item names are too long. Please shorten them to 50 characters or less:`;
          longNames.push(name);
        }
      }
    });

    if (newModuleNames.length !== this.state.modules.length) {
      error = true;
      if (newModuleNames.length > this.state.modules.length) {
        message = `You have more items you want to rename than you have in your course modules.`;
      } else {
        message = `You have less items you want to rename than you have in your course modules.`;
      }
    }

    if (!error) {
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
    let error = null;
    const {
      modules,
      apiKey,
      newModuleNames,
      selectedCourse: courseId
    } = this.state;
    await modules.forEach(async (module, index) => {
      if (newModuleNames[index] !== "") {
        module.new_title = newModuleNames[index];
        console.log(module);
        await axios({
          method: "PUT",
          url: encodeURI(`/api/item`),
          params: {
            apiKey,
            newTitle: module.new_title,
            moduleId: module.module_id,
            itemId: module.id,
            courseId
          }
        })
          .then(res => {
            console.log(res);
          })
          .catch(e => {
            console.log(e);
            return;
          });
      }
    });
    if (error === null) {
      this.setState({
        success: true
      });
    } else {
      return;
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
          <label htmlFor="apiKey">
            Input your API Key:
            <input
              type="text"
              name="apiKey"
              value={this.state.apiKey}
              onChange={this.changeState}
            />
          </label>
          <button type="submit">
            <FontAwesomeIcon icon={faAngleDoubleDown} /> Get Courses
          </button>
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
            label="Upload CSV file."
            onFileLoaded={this.parseCSV}
            onError={this.handleError}
          />
        )}
        {this.state.error && (
          <p className="error">
            <span>Error:</span> {this.state.error}
          </p>
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
        {this.state.modules.length > 0 && this.state.newModuleNames.length > 0 && (
          <>
            {!this.state.success ? (
              <p>
                Here are the modules. Please confirm that the names match up. If
                they do not, or there are mistakes in the new name, please edit
                your CSV file and resubmit it.
              </p>
            ) : (
              <p className="success">
                <span>Congratulations:</span> Module names successfully updated!
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
