require("dotenv").config();
const express = require("express");
const multer = require("multer");
const mysql = require("mysql2/promise");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

/**
 * ============================================
 * CONFIGURACIÓN INICIAL DE LA APLICACIÓN
 * ============================================
 */

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración de CORS para permitir solicitudes desde cualquier origen
const allowedOrigins = [
  "http://localhost:3000",     // dev local
  "https://tiendanicko-production.up.railway.app/productos",
  "https://tiendanicko-production.up.railway.app",     // producción (ajustá según tu dominio)
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Configuración para servir archivos estáticos desde la carpeta 'uploads'
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
  setHeaders: (res, _path) => {
    res.setHeader("Access-Control-Allow-Origin", "*"); // o el origen de tu frontend
  }
}));

/**
 * ============================================
 * DETERMINAR LA CARPETA DE SUBIDA DE ARCHIVOS
 * ============================================
 */

// Candidatos a carpeta de uploads
const posiblesRutas = [
  "/app/uploads", // Railway con volumen montado
  path.join(__dirname, "uploads"), // Local
];

// Buscar la primera ruta que exista o pueda crearse
let uploadsPath = posiblesRutas.find((ruta) => {
  try {
    if (!fs.existsSync(ruta)) {
      fs.mkdirSync(ruta, { recursive: true });
    }
    return fs.existsSync(ruta);
  } catch (err) {
    return false;
  }
});

// Si no se encontró ninguna válida, lanzar error
if (!uploadsPath) {
  throw new Error("No se pudo crear una carpeta de uploads válida.");
}

console.log("📁 Carpeta de uploads:", uploadsPath);

// Servir archivos estáticos desde la carpeta válida
app.use(
  "/uploads",
  express.static(uploadsPath, {
    setHeaders: (res, _path) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
    },
  })
);

/**
 * ============================================
 * CONFIGURACIÓN DE MULTER PARA SUBIDA DE ARCHIVOS
 * ============================================
 */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname
      .replace(/\s+/g, "_")
      .replace(/[^\w.-]/gi, "");
    const uniqueName = `${Date.now()}-${safeName}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Solo se permiten imágenes JPEG, PNG o WEBP"), false);
};

const upload = multer({ storage, fileFilter });

/**
 * ============================================
 * ENDPOINT DE PRUEBA PARA SUBIR UNA IMAGEN
 * ============================================
 */

app.post("/subir", upload.single("imagen"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se subió ninguna imagen" });
  }
  res.json({
    mensaje: "Imagen subida correctamente",
    url: `/uploads/${req.file.filename}`,
  });
});

/**
 * ============================================
 * CONFIGURACIÓN DE LA CONEXIÓN A MYSQL
 * ============================================
 */

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "cellstore_bd",
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
  ssl: { rejectUnauthorized: false }
});

/**
 * ============================================
 * FUNCIONES AUXILIARES
 * ============================================
 */

/**
 * Verifica la conexión con la base de datos
 * @returns {Promise<boolean>} True si la conexión es exitosa
 */
const checkDBConnection = async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Conexión a MySQL establecida");
    conn.release();
    return true;
  } catch (err) {
    console.error("❌ Error de conexión a MySQL:", err.message);
    return false;
  }
};

/**
 * Limpia imágenes no utilizadas en la carpeta uploads
 * @returns {Promise<Object>} Resultado de la operación
 */
async function cleanUnusedImages() {
  try {
    console.log("🔍 Iniciando limpieza de imágenes...");

    // Obtener imágenes usadas en la base de datos
    const [products] = await pool.query(
      "SELECT imagen FROM productos WHERE imagen IS NOT NULL"
    );
    const usedImages = products
      .map((p) => (p.imagen ? path.basename(p.imagen) : null))
      .filter(Boolean);

    // Verificar existencia de carpeta uploads
    const uploadsPath = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
      return { success: true, message: "📁 Carpeta uploads creada", deletedCount: 0 };
    }

    // Identificar imágenes no utilizadas
    const allFiles = fs.readdirSync(uploadsPath);
    const imageFiles = allFiles.filter((file) =>
      [".jpg", ".jpeg", ".png", ".webp"].includes(path.extname(file).toLowerCase())
    );
    const unusedImages = imageFiles.filter((img) => !usedImages.includes(img));

    // Eliminar imágenes no utilizadas
    let deletedCount = 0;
    unusedImages.forEach((img) => {
      try {
        fs.unlinkSync(path.join(uploadsPath, img));
        deletedCount++;
        console.log(`🗑️ Eliminada: ${img}`);
      } catch (err) {
        console.error(`❌ Error eliminando ${img}:`, err.message);
      }
    });

    console.log(`✅ Limpieza completada. Eliminadas: ${deletedCount} imágenes`);
    return { success: true, totalImages: imageFiles.length, unusedImages: unusedImages.length, deletedCount };
  } catch (error) {
    console.error("🔥 Error en limpieza:", error);
    return { success: false, error: error.message };
  }
}

/**
 * ============================================
 * ENDPOINTS DE LA API
 * ============================================
 */

// Health Check del servidor
app.get("/api/health", async (req, res) => {
  const dbStatus = await checkDBConnection();
  res.json({
    status: "active",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date(),
    port: PORT,
    db: dbStatus ? "connected" : "disconnected",
  });
});

// Crear un nuevo producto
app.post("/api/productos", upload.single("imagen"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "La imagen es requerida" });

    const { nombre, descripcion, precio, categoria, subcategoria } = req.body;
    if (!nombre || !precio || !categoria || !subcategoria) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const [result] = await pool.query(
      `INSERT INTO productos (nombre, descripcion, precio, categoria, subcategoria, imagen)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion, parseFloat(precio), categoria, subcategoria, `/uploads/${req.file.filename}`]
    );

    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error("Error al guardar producto:", error);
    res.status(500).json({ error: "Error al guardar el producto" });
  }
  // Devuelve el producto creado
  const [newProduct] = await pool.query("SELECT * FROM productos WHERE id = ?", [result.insertId]);
  res.json({ product: newProduct[0] });
});

// Obtener todos los productos
app.get("/api/productos", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM productos");
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// Obtener un producto específico
app.get("/api/productos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM productos WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({ error: "Error al obtener producto" });
  }
});

// Actualizar un producto
app.put("/api/productos/:id", upload.single("imagen"), async (req, res) => {
  const { id } = req.params;
  try {
    const { nombre, precio, descripcion, categoria, subcategoria } = req.body;
    if (!nombre || !precio || !categoria || !subcategoria) {
      return res.status(400).json({ success: false, error: "Faltan campos obligatorios" });
    }

    // Obtener producto actual
    const [currentProduct] = await pool.query("SELECT imagen FROM productos WHERE id = ?", [id]);
    if (currentProduct.length === 0) {
      return res.status(404).json({ success: false, error: "Producto no encontrado" });
    }

    // Manejo de la imagen
    let imagenPath = currentProduct[0].imagen;
    if (req.file) {
      // Eliminar imagen anterior si existe
      if (imagenPath) {
        const oldPath = path.join(__dirname, imagenPath.replace('/uploads/', 'uploads/'));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      imagenPath = `/uploads/${req.file.filename}`;
    }

    // Actualizar producto en la base de datos
    const [result] = await pool.query(
      `UPDATE productos SET 
        nombre = ?, precio = ?, descripcion = ?, 
        categoria = ?, subcategoria = ?, imagen = ?
       WHERE id = ?`,
      [nombre, parseFloat(precio), descripcion || null, categoria, subcategoria, imagenPath, id]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ success: false, error: "No se pudo actualizar el producto" });
    }

    // Devolver producto actualizado
    const [updatedProduct] = await pool.query("SELECT * FROM productos WHERE id = ?", [id]);
    res.json({
      success: true,
      producto: updatedProduct[0],
      message: "Producto actualizado correctamente",
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error);

    // Limpiar archivo temporal en caso de error
    if (req.file) {
      const tempPath = path.join(__dirname, "uploads", req.file.filename);
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }

    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      details: error.message,
    });
  }
});

// Eliminar un producto
app.delete("/api/productos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Obtener información del producto
    const [rows] = await pool.query("SELECT imagen FROM productos WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Producto no encontrado" });

    // Eliminar producto de la base de datos
    await pool.query("DELETE FROM productos WHERE id = ?", [id]);

    // Eliminar imagen asociada si existe
    const imagePath = path.join(__dirname, rows[0].imagen.replace('/uploads/', 'uploads/'));
    fs.unlink(imagePath, (err) => {
      if (err) console.warn("No se pudo eliminar la imagen:", err.message);
    });

    res.json({ success: true, message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

/**
 * ============================================
 * MANEJO DE ERRORES
 * ============================================
 */

app.use((err, req, res, next) => {
  console.error("‼️ Error del servidor:", err.stack);
  res.status(500).json({
    error: "Error interno del servidor",
    message: err.message,
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: "Recurso no encontrado",
    message: "La ruta solicitada no existe en este servidor",
  });
}
);

/**
 * ============================================
 * INICIO DEL SERVIDOR
 * ============================================
 */

const server = app.listen(PORT, "0.0.0.0", async () => {
  console.log(`🚀 Servidor backend ejecutándose en puerto ${PORT}`);
  console.log(`🟢 Entorno: ${process.env.NODE_ENV || "development"}`);

  // Verificar conexión a DB al iniciar
  const dbConnected = await checkDBConnection();
  if (!dbConnected) {
    console.error("❌ Apagando servidor por fallo en DB...");
    process.exit(1);
  }

  // Limpieza inicial de imágenes
  setTimeout(async () => {
    const result = await cleanUnusedImages();
    console.log(`🔄 ${result.deletedCount} imágenes no utilizadas eliminadas`);
  }, 10000);
});

/**
 * ============================================
 * MANEJO DE SEÑALES DEL SISTEMA
 * ============================================
 */

// Manejo de señal SIGTERM para cierre limpio
process.on("SIGTERM", () => {
  console.log("🛑 Recibida señal SIGTERM. Cerrando servidor...");
  server.close(() => {
    console.log("✋ Servidor HTTP cerrado");
    pool.end(() => {
      console.log("🔴 Conexiones de DB cerradas");
      process.exit(0);
    });
  });
});

// Manejo de excepciones no capturadas
process.on("uncaughtException", (err) => {
  console.error("‼️ Uncaught Exception:", err);
});

// Manejo de promesas rechazadas no capturadas
process.on("unhandledRejection", (reason, promise) => {
  console.error("‼️ Unhandled Rejection at:", promise, "reason:", reason);
});