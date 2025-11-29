const express = require("express");
const path = require("path");
const productsData = require("./productsData");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// Servir frontend estático
app.use(express.static(path.join(__dirname, "public")));

// === API de productos ===

// Lista completa de productos
app.get("/api/products", (req, res) => {
  res.json(productsData);
});

// Búsqueda por nombre (para el buscador táctil)
app.get("/api/products/search", (req, res) => {
  const q = (req.query.q || "").toLowerCase();
  if (!q) return res.json(productsData);

  const filtered = productsData.filter((p) =>
    p.nombre.toLowerCase().includes(q)
  );
  res.json(filtered);
});

// Escaneo por código de barras
app.post("/api/scan", (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ message: "No se recibió código." });
  }

  const limpio = String(code).trim();
  const product = productsData.find((p) => p.codigo === limpio);

  if (!product) {
    return res.status(404).json({ message: "Producto no registrado." });
  }

  res.json(product);
});

// (Opcional) Ruta base
app.get("/api/status", (req, res) => {
  res.json({ status: "ok", message: "Backend del kiosco activo." });
});

app.listen(PORT, () => {
  console.log(`Servidor del kiosco activo en http://localhost:${PORT}`);
});
