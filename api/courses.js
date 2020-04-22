const express = require("express");
const { router: courseRouter } = require("./_routes/courseRoute");

const app = express();

app.use("/api/courses", courseRouter);

module.exports = app;
