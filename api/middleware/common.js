const bodyParser = require("body-parser");
const cors = require("cors");

exports.handleBodyRequestParsing = router => {
  router.use(bodyParser.urlencoded({ extended: true }));
  router.use(bodyParser.json());
};

exports.handleCors = router => {
  router.use(cors());
};
