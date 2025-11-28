const express = require("express");
const router = express.Router();

const { createSale } = require("./saleController");

router.post("/", createSale);

module.exports = router;
