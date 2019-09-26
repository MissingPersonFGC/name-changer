const express = require("express");
const router = express.Router();
const axios = require("axios");

router.route("/").get(async (req, res) => {
  const { apiKey: access_token, courseId } = req.query;
  try {
    await axios({
      method: "GET",
      url: `https://canvas.instructure.com/api/v1/courses/${courseId}/modules`,
      headers: {
        Accept: "application/json+canvas-string-ids"
      },
      params: {
        access_token,
        per_page: 99999,
        include: ["items", "content_details"]
      }
    }).then(result => {
      res.status(200).json({
        data: result.data
      });
    });
  } catch (e) {
    res.status(400);
  }
});

exports.router = router;
