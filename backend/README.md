Kiosko Autoservicio

Sistema web para un kiosko de autoservicio que permite a los usuarios:

Escanear productos mediante cámara

Agregar productos desde un buscador táctil

Armar un carrito de compra

Procesar el pago

Generar un ticket simulado

Todo desde una interfaz optimizada para pantalla táctil.

Este proyecto fue desarrollado para el curso, utilizando:

✔ Backend con Node.js + Express
✔ Productos cargados desde archivo local
✔ Interfaz en HTML/CSS/JS
✔ Rutas REST para consulta y escaneo
✔ Funcionamiento sin base de datos

👩‍💻 Integrantes del proyecto

Francini Vindas

Wendy Parra

Marcelle Fernández

🚀 Tecnologías utilizadas
Backend:

Node.js

Express.js

Nodemon

Frontend:

HTML

CSS

JavaScript (Vanilla)

📂 Estructura del proyecto
ProyectoFinal-Juan/
│
├── backend/
│   ├── app.js
│   ├── productsData.js
│   ├── package.json
│   ├── public/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── app.js
│   ├── README.md
│   └── node_modules/
│
└── 

⚡ Cómo ejecutar el proyecto
1️⃣ Entrar a la carpeta del backend
cd backend

2️⃣ Instalar dependencias
npm install

3️⃣ Ejecutar el servidor
npm run dev


El servidor inicia en:

👉 http://localhost:4000

La interfaz se encuentra en:

backend/public/index.html

🔌 Endpoints disponibles
📦 Productos
GET /api/products

Devuelve todos los productos cargados desde productsData.js.

GET /api/products/search?q=texto

Realiza una búsqueda por nombre o categoría.

Ejemplo:

/api/products/search?q=cafe

POST /api/scan

Simula el escaneo de un código de barras desde la cámara o desde ingreso manual.

Body esperado:

{
  "code": "1001"
}


Respuesta exitosa:

{
  "codigo": "1001",
  "nombre": "Café negro 12oz",
  "precio": 1200,
  "categoria": "Bebidas",
  "imagen": "..."
}

🧾 Ventas

El proceso de compra, cálculo del total e impresión del ticket
👉 se maneja completamente en el frontend.


🖥️ Interfaz de usuario

Incluye:

Botones grandes estilo táctil

Buscador interactivo

Lector de código de barras con cámara (ZXing)

Carrito de compra en tiempo real

Ticket simulado

Modal de ingreso manual de código

Archivo principal:

backend/public/index.html



Asegúrese de ejecutar el backend antes de abrir la interfaz.

El proyecto está diseñado para correr localmente.

🏁 Estado del proyecto

✔ Backend funcional
✔ Interfaz básica implementada
✔ Productos simulados
✔ Flujo de venta operativo
✔ Listo para demostración