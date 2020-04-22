"use strict";
const express = require("express");
const http = require("http");

const router = express();

const middleWare = require("./_middleware");

const { applyMiddleware } = require("./_utils");

const { router: courseRouter } = require("./_routes/courseRoute");
const { router: moduleRouter } = require("./_routes/moduleRoute");
const { router: itemRouter } = require("./_routes/itemRoute");

// import routers above this line
applyMiddleware(middleWare, router);
// use routes below this line

router.use("/api/courses", courseRouter);
router.use("/api/modules", moduleRouter);
router.use("/api/item", itemRouter);

const server = http.createServer(router);

server.listen(4000, () => {
  console.log(`server running on port 4000`);
});
