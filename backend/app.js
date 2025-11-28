const express = require("express");
const cors = require("cors");
require("dotenv").config();

const productRoutes = require("./productRoutes");
const saleRoutes = require("./saleRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Rutas API
app.use("/api/products", productRoutes);
app.use("/api/sales", saleRoutes);

app.get("/", (req, res) => {
  res.send("API del Kiosco funcionando correctamente");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});
