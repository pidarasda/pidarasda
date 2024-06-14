var express = require("express");
var router = express.Router();
const fs = require('fs');

router.get("/", function(req, res){
  res.render("roulette/index");
});
router.get("/table", function(req, res){
  res.render("table/table");
});
module.exports = router;
