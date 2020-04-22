const express = require("express");
const { router: itemRouter } = require("./_routes/itemRoute");

const app = express();

app.use("/api/items", itemRouter);

module.exports = app;
