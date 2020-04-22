const express = require("express");
const { router: moduleRouter } = require("./_routes/moduleRoute");

const app = express();

app.use("/api/modules", moduleRouter);

module.exports = app;
