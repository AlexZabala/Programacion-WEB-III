const mysql = require("mysql2/promise");

// Crear conexión con promesas
async function conectarDB() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "cafeteria_db",
  });
}

// Función para registrar un pedido
async function registrarPedido(cliente_nombre, bebida, cantidad) {
  const connection = await conectarDB();
  const sql =
    "INSERT INTO pedidos_dos (cliente_nombre, bebida, cantidad) VALUES (?, ?, ?)";

  try {
    const [result] = await connection.execute(sql, [
      cliente_nombre,
      bebida,
      cantidad,
    ]);
    console.log(
      `✅ Pedido registrado para ${cliente_nombre} (${cantidad} x ${bebida})`
    );
  } catch (err) {
    console.error("❌ Error registrando el pedido:", err);
  } finally {
    await connection.end();
  }
}

// Función para obtener todos los pedidos
async function obtenerPedidos() {
  const connection = await conectarDB();
  const sql = "SELECT * FROM pedidos_dos ORDER BY fecha DESC";

  try {
    const [rows] = await connection.execute(sql);
    console.log("📋 Pedidos recientes:");
    rows.forEach((pedido, index) => {
      console.log(
        `${index + 1}. ${pedido.cliente_nombre} - ${pedido.bebida} (${
          pedido.cantidad
        })`
      );
    });
  } catch (err) {
    console.error("Error obteniendo los pedidos:", err);
  } finally {
    await connection.end();
  }
}

// Función para obtener el total de ventas de una bebida específica
async function obtenerVentasPorBebida(bebida) {
  const connection = await conectarDB();
  const sql =
    "SELECT SUM(cantidad) AS total_ventas FROM pedidos_dos WHERE bebida = ?";

  try {
    const [rows] = await connection.execute(sql, [bebida]);
    console.log(`☕ Total de ventas de ${bebida}: ${rows[0].total_ventas}`);
  } catch (err) {
    console.error("Error obteniendo las ventas:", err);
  } finally {
    await connection.end();
  }
}

// Simulación de pedidos
async function ejecutarSimulacion() {
  await registrarPedido("Juan Pérez", "Café", 2);
  await registrarPedido("Ana Gómez", "Te", 3);
  await registrarPedido("Carlos Ruiz", "Café", 1);
  await registrarPedido("Daniela Ribera", "Jugo", 4);

  // Esperar 2 segundos para mostrar los pedidos y las ventas
  setTimeout(() => {
    obtenerPedidos();
    obtenerVentasPorBebida("Café");
  }, 2000);
}

ejecutarSimulacion();
