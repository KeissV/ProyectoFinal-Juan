// Lista de productos que maneja el kiosco.
// IMPORTANTE: Cambia "COD_HELADO" y "COD_FANTA" por los códigos reales EAN
// que lees en el empaque del helado y la Fanta Uva.

const products = [
  {
    codigo: "COD_HELADO", // EJ: 7441001234567
    nombre: "Helado Dos Pinos Choco Chips",
    precio: 1500,
    categoria: "Helados",
    imagen: "/images/helado_choco_chips.jpg"
  },
  {
    codigo: "7441003596221", // EJ: 7801009876543
    nombre: "Fanta Uva 600 ml",
    precio: 1200,
    categoria: "Bebidas",
    imagen: "/images/fanta_uva.jpg"
  },
  // Más productos para que el buscador tenga sentido:
  {
    codigo: "COD_COCA",
    nombre: "Coca Cola 600 ml",
    precio: 1200,
    categoria: "Bebidas",
    imagen: "/images/coca_cola.jpg"
  },
  {
    codigo: "COD_TOSH",
    nombre: "Galletas Tosh Integral",
    precio: 950,
    categoria: "Snacks",
    imagen: "/images/tosh_integral.jpg"
  },
  {
    codigo: "COD_CAFE",
    nombre: "Café 1820 Clásico 500g",
    precio: 3200,
    categoria: "Abarrotes",
    imagen: "/images/cafe_1820.jpg"
  },
  {
    codigo: "COD_ARROZ",
    nombre: "Arroz Tío Pelón 1kg",
    precio: 1100,
    categoria: "Abarrotes",
    imagen: "/images/arroz_tiopelon.jpg"
  },
  {
    codigo: "COD_LECHE",
    nombre: "Leche Dos Pinos Entera 1L",
    precio: 900,
    categoria: "Lácteos",
    imagen: "/images/leche_dospinos.jpg"
  },
  {
    codigo: "COD_PAN",
    nombre: "Pan Bimbo Blanco",
    precio: 1400,
    categoria: "Panadería",
    imagen: "/images/pan_bimbo.jpg"
  }
];

module.exports = products;
