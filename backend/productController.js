const { getConnection, sql } = require("./db");
const { simulateBarcodeScan } = require("./barcodeSimulator");

async function scanProduct(req, res) {
  try {
    let { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: "Se requiere el código de barras." });
    }

    code = simulateBarcodeScan(code);

    const pool = await getConnection();
    const result = await pool
      .request()
      .input("codigo", sql.VarChar(50), code)
      .query(`
        SELECT ProductoId, Nombre, Precio, Stock, CodigoBarra
        FROM Producto
        WHERE CodigoBarra = @codigo AND Activo = 1
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error("Error en scanProduct:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
}

async function listProducts(req, res) {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT ProductoId, Nombre, Precio, Stock FROM Producto WHERE Activo = 1
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error en listProducts:", error);
    res.status(500).json({ message: "Error interno" });
  }
}

module.exports = { scanProduct, listProducts };
