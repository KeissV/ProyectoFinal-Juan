const API_BASE = "/api";

let carrito = [];
let productsCache = [];
let codeReader = null;
let selectedDeviceId = null;
let scanning = false;
let scanTimeout = null;
let ultimoCodigoLeido = null;


// Elementos DOM
const video = document.getElementById("video");
const scannerStatus = document.getElementById("scanner-status");
const lastScanText = document.getElementById("last-scan-text");
const cartItemsDiv = document.getElementById("cart-items");
const cartTotalSpan = document.getElementById("cart-total");
const ticketDiv = document.getElementById("ticket");
const searchInput = document.getElementById("search-input");
const searchResultsDiv = document.getElementById("search-results");

const btnStart = document.getElementById("btnStart");
const btnStop = document.getElementById("btnStop");
const btnPay = document.getElementById("btnPay");
const btnClear = document.getElementById("btnClear");

const modal = document.getElementById("print-modal");
const modalYes = document.getElementById("modal-yes");
const modalNo = document.getElementById("modal-no");

// === Sonido beep al escanear ===
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(1000, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    setTimeout(() => {
      osc.stop();
      ctx.close();
    }, 120);
  } catch (e) {
  }
}

// === Carrito ===
function agregarAlCarrito(producto) {
  const existente = carrito.find((item) => item.codigo === producto.codigo);
  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({
      codigo: producto.codigo,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1
    });
  }
  renderCarrito();
}

function renderCarrito() {
  if (carrito.length === 0) {
    cartItemsDiv.innerHTML =
      "<p>Sin productos. Escanee o agregue desde el buscador.</p>";
    cartTotalSpan.textContent = "₡0";
    return;
  }

  let html = "";
  let total = 0;

  carrito.forEach((item) => {
    const subtotal = item.cantidad * item.precio;
    total += subtotal;
    html += `
      <div class="cart-item">
        <div class="cart-item-main">
          <span class="cart-item-name">${item.nombre}</span>
          <span class="cart-item-qty">Cantidad: ${item.cantidad}</span>
        </div>
        <span class="cart-item-price">₡${subtotal}</span>
      </div>
    `;
  });

  cartItemsDiv.innerHTML = html;
  cartTotalSpan.textContent = `₡${total}`;
}

btnClear.addEventListener("click", () => {
  carrito = [];
  renderCarrito();
  ticketDiv.innerHTML = "<p>Realice una compra para generar la factura.</p>";
  lastScanText.textContent = "Aún no se ha escaneado ningún producto.";
});

// === Factura / Ticket ===
function generarTicketTexto() {
  if (carrito.length === 0) return "No hay productos en el carrito.";

  let total = 0;
  const lines = [];

  lines.push("         KIOSCO AUTOSERVICIO");
  lines.push("--------------------------------------");
  lines.push("Producto               Cant  Subtotal");
  lines.push("--------------------------------------");

  carrito.forEach((item) => {
    const subtotal = item.cantidad * item.precio;
    total += subtotal;
    let nombre = item.nombre;
    if (nombre.length > 20) nombre = nombre.slice(0, 20);
    const linea = `${nombre.padEnd(20, " ")} ${String(item.cantidad)
      .padStart(2, " ")}   ₡${String(subtotal).padStart(6, " ")}`;
    lines.push(linea);
  });

  lines.push("--------------------------------------");
  lines.push(`TOTAL:                       ₡${total}`);
  lines.push("--------------------------------------");
  lines.push("Gracias por su compra.");

  return lines.join("\n");
}

// Botón pagar
btnPay.addEventListener("click", () => {
  if (carrito.length === 0) {
    ticketDiv.textContent = "No hay productos en el carrito.";
    return;
  }
  // Mostrar modal de confirmación
  modal.classList.remove("hidden");
});

modalYes.addEventListener("click", () => {
  modal.classList.add("hidden");
  // Simular impresión: 7 segundos
  const ticketTexto = generarTicketTexto();
  ticketDiv.textContent = "Imprimiendo factura...\n\n" + ticketTexto;

  btnPay.disabled = true;
  btnClear.disabled = true;

  setTimeout(() => {
    ticketDiv.textContent =
      "Factura impresa con éxito, gracias por su compra.";
    carrito = [];
    renderCarrito();
    btnPay.disabled = false;
    btnClear.disabled = false;
  }, 7000);
});

modalNo.addEventListener("click", () => {
  modal.classList.add("hidden");
  ticketDiv.textContent = "Compra finalizada sin impresión de factura.";
  carrito = [];
  renderCarrito();
});

// === Lógica del escáner (ZXing) ===
function manejarResultadoEscaneo(codigo) {
  const limpio = codigo.trim();
  console.log("Código escaneado:", limpio); // Aquí verificamos el código que ZXing lee
  
  fetch(`${API_BASE}/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: limpio }) // Enviar el código al backend
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Producto no registrado.");
      }
      return res.json();
    })
    .then((producto) => {
      playBeep();
      lastScanText.textContent = `Escaneado: ${producto.nombre} (₡${producto.precio})`;
      agregarAlCarrito(producto);
    })
    .catch((err) => {
      lastScanText.textContent = err.message;
    });
}


async function iniciarScanner() {
  if (scanning) return;
  try {
    codeReader = new ZXing.BrowserMultiFormatReader();
    const devices = await codeReader.listVideoInputDevices();

    if (devices.length === 0) {
      scannerStatus.textContent = "No se encontraron cámaras disponibles.";
      return;
    }

    selectedDeviceId = devices[0].deviceId;
    scannerStatus.textContent =
      "Escaneando... Apunte el código de barras a la cámara.";
    scanning = true;

     // ⏱️ NUEVO: temporizador de 7 segundos
    scanTimeout = setTimeout(() => {
      detenerScanner();      // apaga la cámara
      mostrarModalManual();  // abre el modal para código manual
    }, 7000);

    codeReader.decodeFromVideoDevice(
  selectedDeviceId,
  video,
  { video: { width: { ideal: 1920 }, height: { ideal: 1080 } } },
  (result, err) => {
      if (result) {
         // NUEVO: si sí leyó algo, cancelamos el timeout
          if (scanTimeout) {
            clearTimeout(scanTimeout);
            scanTimeout = null;
          }
        manejarResultadoEscaneo(result.text);
      }
    });
  } catch (error) {
    console.error(error);
    scannerStatus.textContent = "Error al iniciar el escáner.";
  }
}

function detenerScanner() {
  if (codeReader) {
    codeReader.reset();
  }

// NUEVO: limpiar el temporizador si quedaba activo
  if (scanTimeout) {
    clearTimeout(scanTimeout);
    scanTimeout = null;
  }

  scanning = false;
  scannerStatus.textContent =
    "Escáner detenido. Presione 'Iniciar escáner' para continuar.";
}

btnStart.addEventListener("click", iniciarScanner);
btnStop.addEventListener("click", detenerScanner);

// === Buscador táctil ===
function renderSearchResults(list) {
  if (!list || list.length === 0) {
    searchResultsDiv.innerHTML = "<p>No se encontraron productos.</p>";
    return;
  }

  let html = "";
  list.forEach((p) => {
    html += `
      <div class="product-card">
        <img src="${p.imagen}" alt="${p.nombre}" class="product-image" onerror="this.style.display='none'" />
        <div class="product-info">
          <div class="product-name">${p.nombre}</div>
          <div class="product-price">₡${p.precio}</div>
          <div class="product-category">${p.categoria}</div>
        </div>
        <button class="btn btn-primary" onclick='agregarDesdeBuscador(${JSON.stringify(
          p
        )})'>➕</button>
      </div>
    `;
  });

  searchResultsDiv.innerHTML = html;
}

function agregarDesdeBuscador(producto) {
  agregarAlCarrito(producto);
  lastScanText.textContent = `Agregado desde buscador: ${producto.nombre}`;
}

searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim();
  if (!q) {
    renderSearchResults(productsCache);
    return;
  }

  fetch(`${API_BASE}/products/search?q=${encodeURIComponent(q)}`)
    .then((res) => res.json())
    .then((data) => {
      renderSearchResults(data);
    })
    .catch(() => {
      searchResultsDiv.innerHTML =
        "<p>Error buscando productos.</p>";
    });
});

// Cargar productos al inicio
function cargarProductos() {
  fetch(`${API_BASE}/products`)
    .then((res) => res.json())
    .then((data) => {
      productsCache = data;
      renderSearchResults(data);
    })
    .catch(() => {
      searchResultsDiv.innerHTML = "<p>Error cargando productos.</p>";
    });
}

cargarProductos();
renderCarrito();


// === Modal de ingreso manual ===

const manualModal = document.getElementById("manualModal");
const codigoManualInput = document.getElementById("codigoManualInput");
const btnManualEnviar = document.getElementById("btnManualEnviar");
const btnManualCerrar = document.getElementById("btnManualCerrar");

// Mostrar modal
function mostrarModalManual() {
  console.log("MOSTRAR MODAL EJECUTADO"); // para depuración
  codigoManualInput.value = "";
  manualModal.style.display = "flex";
  codigoManualInput.focus();
}

// Cerrar modal
function cerrarModalManual() {
  manualModal.style.display = "none";
}

// Cuando el usuario agrega un código manualmente
btnManualEnviar.addEventListener("click", () => {
  const codigo = codigoManualInput.value.trim();

  if (!codigo) {
    alert("Ingrese un código de barras.");
    return;
  }

  fetch(`${API_BASE}/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: codigo })
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Producto no registrado.");
      }
      return res.json();
    })
    .then((producto) => {
      agregarAlCarrito(producto);
      lastScanText.textContent = `Agregado manualmente: ${producto.nombre}`;
      cerrarModalManual();
    })
    .catch(() => {
      alert("No se encontró un producto con ese código.");
    });
});

// Botón cancelar
btnManualCerrar.addEventListener("click", () => {
  cerrarModalManual();
});
