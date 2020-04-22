const express = require("express");
const router = express.Router();
const axios = require("axios");
const middleWare = require("../_middleware");
const { applyMiddleware } = require("../_utils");

applyMiddleware(middleWare, router);

router.route("/").put(async (req, res) => {
  const {
    apiKey: access_token,
    courseId,
    itemId,
    moduleId,
    newTitle: title,
  } = req.body;
  try {
    await axios({
      method: "PUT",
      url: `https://canvas.instructure.com/api/v1/courses/${courseId}/modules/${moduleId}/items/${itemId}`,
      params: {
        access_token,
      },
      data: {
        module_item: {
          title,
        },
      },
    }).then((result) => {
      res.status(201).json({
        data: result.data,
      });
    });
  } catch (e) {
    res.status(401).send(e);
    console.log(e);
  }
});

exports.router = router;
