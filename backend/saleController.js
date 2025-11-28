const { getConnection, sql } = require("./db");
const { printTicket } = require("./printerSimulator");

async function createSale(req, res) {
  const { items, metodoPago } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Carrito vacío" });
  }

  try {
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    let total = items.reduce((acc, it) => acc + it.cantidad * it.precio, 0);

    const ventaResult = await new sql.Request(transaction)
      .input("total", sql.Decimal(10, 2), total)
      .input("metodo", sql.VarChar(20), metodoPago || "EFECTIVO")
      .query(`
        INSERT INTO Venta (Total, MetodoPago)
        OUTPUT INSERTED.VentaId
        VALUES (@total, @metodo)
      `);

    const ventaId = ventaResult.recordset[0].VentaId;

    for (const item of items) {
      const subtotal = item.cantidad * item.precio;

      await new sql.Request(transaction)
        .input("ventaId", sql.Int, ventaId)
        .input("productoId", sql.Int, item.productoId)
        .input("cantidad", sql.Int, item.cantidad)
        .input("subtotal", sql.Decimal(10, 2), subtotal)
        .query(`
          INSERT INTO DetalleVenta (VentaId, ProductoId, Cantidad, Subtotal)
          VALUES (@ventaId, @productoId, @cantidad, @subtotal)
        `);

      await new sql.Request(transaction)
        .input("productoId", sql.Int, item.productoId)
        .input("cantidad", sql.Int, item.cantidad)
        .query(`
          UPDATE Producto SET Stock = Stock - @cantidad
          WHERE ProductoId = @productoId
        `);
    }

    await transaction.commit();

    // Ticket
    let ticket = `=== TICKET ===\nVenta: ${ventaId}\n`;
    items.forEach(i => {
      ticket += `${i.nombre} x${i.cantidad} - ₡${i.precio}\n`;
    });
    ticket += `TOTAL: ₡${total}`;

    printTicket(ticket);

    res.json({ message: "Venta registrada", ventaId });
  } catch (error) {
    console.error("Error en createSale:", error);
    res.status(500).json({ message: "Error interno" });
  }
}

module.exports = { createSale };
