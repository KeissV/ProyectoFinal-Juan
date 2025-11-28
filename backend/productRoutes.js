const express = require("express");
const router = express.Router();

const { scanProduct, listProducts } = require("./productController");

router.post("/scan", scanProduct);
router.get("/", listProducts);

module.exports = router;
