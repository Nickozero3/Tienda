require('dotenv').config();
const express = require('express');
const multer = require('multer');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// ======================
// Configuración Inicial
// ======================

// Configuración CORS para producción y desarrollo
const allowedOrigins = [
  'http://localhost:3000',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.error('Bloqueado por CORS:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Middleware para archivos estáticos
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// ======================
// Configuración Multer
// ======================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsPath = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
    }
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname
      .replace(/\s+/g, '_')
      .replace(/[^\w.-]/gi, '');
    const uniqueName = `${Date.now()}-${safeName}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Solo se permiten imágenes JPEG, PNG o WEBP'), false);
};

const upload = multer({ storage, fileFilter });

// ======================
// Conexión a MySQL
// ======================

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost', // Cambiado a localhost
  user: process.env.DB_USER || 'root',
  password: process.env.DB_USER || '',
  database: process.env.DB_NAME || 'cellstore_bd',
  port: process.env.DB_PORT || 3306, // Puerto por defecto de MySQL
  waitForConnections: true,
  connectionLimit: 10,
  ssl: null // SSL no es necesario en localhost
});

// Verificación de conexión a la base de datos
const checkDBConnection = async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Conexión a MySQL establecida');
    conn.release();
    return true;
  } catch (err) {
    console.error('❌ Error de conexión a MySQL:', err.message);
    return false;
  }
};

// ======================
// Funciones de Utilidad
// ======================

async function cleanUnusedImages() {
  try {
    console.log('🔍 Iniciando limpieza de imágenes...');
    const [products] = await pool.query(
      'SELECT imagen FROM productos WHERE imagen IS NOT NULL'
    );
    const usedImages = products
      .map((p) => (p.imagen ? path.basename(p.imagen) : null))
      .filter(Boolean);

    const uploadsPath = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
      return {
        success: true,
        message: '📁 Carpeta uploads creada',
        deletedCount: 0
      };
    }

    const allFiles = fs.readdirSync(uploadsPath);
    const imageFiles = allFiles.filter((file) =>
      ['.jpg', '.jpeg', '.png', '.webp'].includes(
        path.extname(file).toLowerCase()
      )
    );
    const unusedImages = imageFiles.filter((img) => !usedImages.includes(img));

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
    return {
      success: true,
      totalImages: imageFiles.length,
      unusedImages: unusedImages.length,
      deletedCount
    };
  } catch (error) {
    console.error('🔥 Error en limpieza:', error);
    return { success: false, error: error.message };
  }
}

// ======================
// Endpoints de la API
// ======================

// Health Check mejorado
app.get('/api/health', async (req, res) => {
  const dbStatus = await checkDBConnection();
  res.json({
    status: 'active',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date(),
    port: PORT,
    db: dbStatus ? 'connected' : 'disconnected'
  });
});

// Endpoint para limpieza manual
app.get('/api/cleanup-images', async (req, res) => {
  const result = await cleanUnusedImages();
  result.success ? res.json(result) : res.status(500).json(result);
});

// CRUD de Productos
app.post('/api/productos', upload.single('imagen'), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: 'La imagen es requerida' });

    const { nombre, descripcion, precio, categoria, subcategoria } = req.body;
    if (!nombre || !precio || !categoria || !subcategoria) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const [result] = await pool.query(
      `INSERT INTO productos (nombre, descripcion, precio, categoria, subcategoria, imagen)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        descripcion,
        parseFloat(precio),
        categoria,
        subcategoria,
        `/uploads/${req.file.filename}`
      ]
    );

    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Error al guardar producto:', error);
    res.status(500).json({ error: 'Error al guardar el producto' });
  }
});

app.get('/api/productos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productos');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

app.get('/api/productos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [id]);
    if (rows.length === 0)
      return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

app.put('/api/productos/:id', upload.single('imagen'), async (req, res) => {
  const { id } = req.params;
  try {
    const { nombre, precio, descripcion, categoria, subcategoria } = req.body;
    if (!nombre || !precio || !categoria || !subcategoria) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos obligatorios'
      });
    }

    const [currentProduct] = await pool.query(
      'SELECT imagen FROM productos WHERE id = ?',
      [id]
    );
    if (currentProduct.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    let imagenPath = currentProduct[0].imagen;
    if (req.file) {
      if (imagenPath) {
        const oldPath = path.join(__dirname, 'public', imagenPath);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      imagenPath = `/uploads/${req.file.filename}`;
    }

    const [result] = await pool.query(
      `UPDATE productos SET 
        nombre = ?, 
        precio = ?, 
        descripcion = ?, 
        categoria = ?, 
        subcategoria = ?, 
        imagen = ?
       WHERE id = ?`,
      [
        nombre,
        parseFloat(precio),
        descripcion || null,
        categoria,
        subcategoria,
        imagenPath,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({
        success: false,
        error: 'No se pudo actualizar el producto'
      });
    }

    const [updatedProduct] = await pool.query(
      'SELECT * FROM productos WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      producto: updatedProduct[0],
      message: 'Producto actualizado correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);

    if (req.file) {
      const tempPath = path.join(
        __dirname,
        'public',
        'uploads',
        req.file.filename
      );
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }

    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

app.delete('/api/productos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT imagen FROM productos WHERE id = ?',
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: 'Producto no encontrado' });

    const imagePath = path.join(__dirname, 'public', rows[0].imagen);
    await pool.query('DELETE FROM productos WHERE id = ?', [id]);

    fs.unlink(imagePath, (err) => {
      if (err) console.warn('No se pudo eliminar la imagen:', err.message);
    });

    res.json({ success: true, message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// ======================
// Manejo de Errores
// ======================

app.use((err, req, res, next) => {
  console.error('‼️ Error del servidor:', err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message 
  });
});

// ======================
// Inicio del Servidor
// ======================

const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Servidor backend ejecutándose en puerto ${PORT}`);
  console.log(`🟢 Entorno: ${process.env.NODE_ENV || 'development'}`);
  
  // Verificar conexión a DB al iniciar
  const dbConnected = await checkDBConnection();
  if (!dbConnected) {
    console.error('❌ Apagando servidor por fallo en DB...');
    process.exit(1);
  }

  // Limpieza inicial de imágenes
  setTimeout(async () => {
    const result = await cleanUnusedImages();
    console.log(`🔄 ${result.deletedCount} imágenes no utilizadas eliminadas`);
  }, 10000);
});

// Manejo de señales para Railway
process.on('SIGTERM', () => {
  console.log('🛑 Recibida señal SIGTERM. Cerrando servidor...');
  server.close(() => {
    console.log('✋ Servidor HTTP cerrado');
    pool.end(() => {
      console.log('🔴 Conexiones de DB cerradas');
      process.exit(0);
    });
  });
});

process.on('uncaughtException', (err) => {
  console.error('‼️ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('‼️ Unhandled Rejection at:', promise, 'reason:', reason);
});