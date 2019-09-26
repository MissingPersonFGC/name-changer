const express = require("express");
const router = express.Router();
const axios = require("axios");

router.route("/").put(async (req, res) => {
  const {
    apiKey: access_token,
    courseId,
    itemId,
    moduleId,
    newTitle: title
  } = req.query;
  try {
    await axios({
      method: "PUT",
      url: `https://canvas.instructure.com/api/v1/courses/${courseId}/modules/${moduleId}/items/${itemId}`,
      params: {
        access_token
      },
      data: {
        module_item: {
          title
        }
      }
    }).then(result => {
      res.status(201).json({
        data: result.data
      });
    });
  } catch (e) {
    console.log(e);
  }
});

exports.router = router;
