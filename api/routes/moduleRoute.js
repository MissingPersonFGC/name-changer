const express = require("express");
const router = express.Router();
const axios = require("axios");

router.route("/").get(async (req, res) => {
  const { apiKey: access_token, courseId } = req.query;
  try {
    const result = await axios({
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
    });
    await Promise.all(
      result.data.map(async unit => {
        if (unit.items_count > 100) {
          unit.items = [];
          let currentPage = 1;
          const totalPages = Math.ceil(unit.items_count / 100);
          async function apiPagination() {
            console.log(currentPage);
            const itemRes = await axios({
              method: "GET",
              url: `https://canvas.instructure.com/api/v1/courses/${courseId}/modules/${unit.id}/items`,
              headers: {
                Accept: "application/json+canvas-string-ids"
              },
              params: {
                access_token,
                per_page: 100,
                page: currentPage
              }
            });
            itemRes.data.forEach(item => {
              unit.items.push(item);
            });
            if (currentPage < totalPages) {
              currentPage = currentPage + 1;
              await apiPagination();
            }
          }
          await apiPagination();
        }
      })
    );

    res.status(200).json({
      data: result.data
    });
  } catch (e) {
    res.status(400);
  }
});

exports.router = router;
