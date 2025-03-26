const mysql = require("mysql2");

// Configurar la conexión
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "cafeteria_db",
});

// Conectar a MySQL
connection.connect((err) => {
  if (err) throw err;
  console.log("📡 Conectado a la base de datos cafeteria_db");
});

// Función para registrar productos
function registrarProducto(nombre, precio) {
  const sql = "INSERT INTO productos (nombre, precio) VALUES (?, ?)";
  connection.query(sql, [nombre, precio], (err, result) => {
    if (err) throw err;
    console.log(`✅ Producto registrado: ${nombre} - $${precio}`);
  });
}

// Función para registrar un pedido
function registrarPedido(cliente, productos) {
  let total = 0;

  // Calcular el total del pedido
  productos.forEach((p) => {
    total += p.precio * p.cantidad;
  });

  const sqlPedido = "INSERT INTO pedidos (cliente, total) VALUES (?, ?)";
  connection.query(sqlPedido, [cliente, total], (err, result) => {
    if (err) throw err;
    const pedidoId = result.insertId;

    console.log(`📦 Pedido registrado para ${cliente} - Total: $${total}`);

    // Insertar productos en detalle_pedido
    productos.forEach((p) => {
      const sqlDetalle =
        "INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) VALUES (?, ?, ?, ?)";
      connection.query(
        sqlDetalle,
        [pedidoId, p.id, p.cantidad, p.precio * p.cantidad],
        (err, result) => {
          if (err) throw err;
          console.log(`🛒 ${p.cantidad}x ${p.nombre} agregado al pedido`);
        }
      );
    });
  });
}

// Función para obtener el total de ventas de un día
function obtenerVentasDelDia(fecha) {
  const sql = "SELECT SUM(total) AS total FROM pedidos WHERE DATE(fecha) = ?";
  connection.query(sql, [fecha], (err, result) => {
    if (err) throw err;
    console.log(`📊 Total de ventas el ${fecha}: $${result[0].total || 0}`);
    connection.end();
  });
}

// Registrar algunos productos
registrarProducto("Café Americano", 2.5);
registrarProducto("Capuchino", 3.0);
registrarProducto("Croissant", 1.5);

// Simular un pedido después de 3 segundos
setTimeout(() => {
  registrarPedido("Juan Pérez", [
    { id: 1, nombre: "Café Americano", cantidad: 2, precio: 2.5 },
    { id: 2, nombre: "Capuchino", cantidad: 1, precio: 3.0 },
  ]);
}, 3000);

// Obtener ventas después de 5 segundos
setTimeout(() => {
  const hoy = new Date().toISOString().split("T")[0]; // Obtener fecha actual
  obtenerVentasDelDia(hoy);
}, 5000);
