const fs = require("fs");
const path = require("path");

function printTicket(content) {
  const filePath = path.join(__dirname, "ticket_impreso.txt");
  fs.writeFileSync(filePath, content, "utf8");
  console.log("🖨 Ticket impreso en:", filePath);
}

module.exports = { printTicket };
