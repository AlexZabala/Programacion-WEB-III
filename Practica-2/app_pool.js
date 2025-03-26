const mysql = require("mysql2/promise");
const moment = require("moment"); // Importamos moment para formatear la fecha

// Crear el pool de conexiones
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "cafeteria_db",
  waitForConnections: true,
  connectionLimit: 10, // Máximo de conexiones simultáneas
  queueLimit: 0,
});

// Función para registrar un pedido con detalles
async function registrarPedido(cliente, productos) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction(); // Iniciar transacción

    // Insertar pedido
    const [pedidoResult] = await connection.execute(
      "INSERT INTO pedidos (cliente, total, fecha) VALUES (?, ?, ?)",
      [cliente, 0, moment().format("YYYY-MM-DD HH:mm:ss")] // Fecha actual en formato amigable
    );
    const pedidoId = pedidoResult.insertId;

    let total = 0;

    // Insertar detalles del pedido
    for (const { producto_id, cantidad } of productos) {
      const [producto] = await connection.execute(
        "SELECT precio FROM productos WHERE id = ?",
        [producto_id]
      );
      if (producto.length === 0) throw new Error("Producto no encontrado");

      const precio = producto[0].precio;
      const subtotal = precio * cantidad;
      total += subtotal;

      // Imprimir el cálculo del subtotal para depurar
      console.log(
        `Producto ID: ${producto_id}, Precio: ${precio}, Cantidad: ${cantidad}, Subtotal: ${subtotal}`
      );

      await connection.execute(
        "INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) VALUES (?, ?, ?, ?)",
        [pedidoId, producto_id, cantidad, subtotal]
      );
    }

    // Actualizar total en la tabla pedidos
    await connection.execute("UPDATE pedidos SET total = ? WHERE id = ?", [
      total,
      pedidoId,
    ]);

    await connection.commit(); // Confirmar transacción
    console.log(`✅ Pedido registrado para ${cliente} con total de $${total}`);
  } catch (err) {
    await connection.rollback(); // Deshacer cambios si hay error
    console.error("❌ Error registrando el pedido:", err);
  } finally {
    connection.release(); // Liberar la conexión
  }
}

// Función para obtener los pedidos
async function obtenerPedidos() {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute("SELECT * FROM pedidos");
    console.log("📋 Lista de pedidos:");

    // Imprimir fecha amigable
    const pedidosConFechasAmigables = rows.map((pedido) => ({
      ...pedido,
      fecha: moment(pedido.fecha).format("YYYY-MM-DD HH:mm:ss"), // Convertimos la fecha
    }));

    console.table(pedidosConFechasAmigables);
  } catch (err) {
    console.error("❌ Error obteniendo los pedidos:", err);
  } finally {
    connection.release();
  }
}

// Función principal de prueba
async function main() {
  await registrarPedido("Luis García", [
    { producto_id: 1, cantidad: 2 },
    { producto_id: 2, cantidad: 1 },
  ]);

  await registrarPedido("Ana Pérez", [
    { producto_id: 1, cantidad: 1 },
    { producto_id: 3, cantidad: 2 },
  ]);

  await obtenerPedidos();
}

main();
