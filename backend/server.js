require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const app = express();
const PORT = process.env.PORT || 5000;

// ========================================
// CONFIGURACIÓN
// ========================================

// Configuración de PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuración de Multer
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// ========================================
// INICIALIZACIÓN DE BASE DE DATOS
// ========================================

async function initDatabase() {
  try {
    console.log('🔄 Verificando base de datos...');

    // Crear tabla de categorías
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categorias (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL UNIQUE,
        descripcion TEXT,
        icono VARCHAR(50) DEFAULT '🏷️',
        color VARCHAR(50) DEFAULT 'blue',
        orden INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla categorias lista');

    // Crear tabla de promociones
    await pool.query(`
      CREATE TABLE IF NOT EXISTS promociones (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        imagen_url VARCHAR(500) UNIQUE NOT NULL,
        cloudinary_id VARCHAR(255) UNIQUE NOT NULL,
        categoria_id INTEGER REFERENCES categorias(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla promociones lista');

    // ⭐ AGREGAR COLUMNA ORDEN (si no existe) - ESTO ES SEGURO
    await pool.query(`
      ALTER TABLE promociones 
      ADD COLUMN IF NOT EXISTS orden INTEGER DEFAULT 0;
    `);
    console.log('✅ Campo "orden" verificado en tabla promociones');

    // ⭐ AGREGAR COLUMNA VISIBLE (si no existe) - PARA OCULTAR PROMOCIONES
    await pool.query(`
      ALTER TABLE promociones 
      ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT true;
    `);
    console.log('✅ Campo "visible" verificado en tabla promociones');

    // Crear tabla de configuración del negocio
    await pool.query(`
      CREATE TABLE IF NOT EXISTS configuracion (
        id SERIAL PRIMARY KEY,
        nombre_negocio VARCHAR(255) DEFAULT 'Minimercado',
        ubicacion VARCHAR(255),
        latitud DECIMAL(10, 8),
        longitud DECIMAL(11, 8),
        telefono VARCHAR(50),
        telefono_whatsapp VARCHAR(50),
        horarios TEXT,
        mensaje_whatsapp TEXT DEFAULT 'Hola! Quisiera consultar sobre una promoción',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla configuracion lista');

    // Verificar categorías por defecto
    const catCheck = await pool.query('SELECT COUNT(*) FROM categorias');
    
    if (catCheck.rows[0].count === '0') {
      await pool.query(`
        INSERT INTO categorias (nombre, descripcion, icono, color, orden) VALUES
        ('Promociones Navideñas', 'Ofertas especiales para la temporada navideña', '🎄', 'red', 1),
        ('Bebidas', 'Promociones en bebidas y refrescos', '🥤', 'blue', 2),
        ('Almacén', 'Ofertas en productos de almacén', '🛒', 'green', 3),
        ('Carnicería', 'Promociones en carnes y embutidos', '🥩', 'orange', 4);
      `);
      console.log('✅ Categorías por defecto creadas');
    }

    // Verificar configuración por defecto
    const configCheck = await pool.query('SELECT COUNT(*) FROM configuracion');
    
    if (configCheck.rows[0].count === '0') {
      await pool.query(`
        INSERT INTO configuracion (
          nombre_negocio, 
          ubicacion, 
          latitud, 
          longitud, 
          telefono, 
          telefono_whatsapp, 
          horarios,
          mensaje_whatsapp
        ) VALUES (
          'Minimercado',
          'Mendoza, Argentina',
          -32.889458,
          -68.845839,
          '+54 261 123-4567',
          '5492611234567',
          'Lunes a Viernes: 8:00 - 20:00
Sábados: 9:00 - 13:00
Domingos: Cerrado',
          'Hola! Quisiera consultar sobre una promoción'
        );
      `);
      console.log('✅ Configuración por defecto creada');
    }

    console.log('✅ Base de datos inicializada correctamente\n');
    console.log(`🔐 PIN configurado: ${process.env.ADMIN_PIN}\n`);
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error.message);
    process.exit(1);
  }
}

// ========================================
// MIDDLEWARE DE AUTENTICACIÓN (SIMPLIFICADO)
// ========================================

const authMiddleware = (req, res, next) => {
  try {
    const isAuthenticated = req.headers['x-authenticated'];

    if (isAuthenticated !== 'true') {
      return res.status(401).json({ error: 'No autenticado' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Error en la verificación de autenticación' });
  }
};

// ========================================
// MIDDLEWARES GLOBALES
// ========================================

// Configuración de CORS para producción
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para compartir pool
app.use((req, res, next) => {
  req.pool = pool;
  next();
});

// ========================================
// RUTAS DE AUTENTICACIÓN
// ========================================

// POST /api/auth/login - SIMPLIFICADO SIN JWT
app.post('/api/auth/login', async (req, res) => {
  try {
    const { pin } = req.body;

    console.log('🔐 Intento de login con PIN:', pin);

    if (!pin || pin.length !== 4) {
      return res.status(400).json({ error: 'PIN debe ser de 4 dígitos' });
    }

    // Comparar directamente con el PIN del .env
    if (pin === process.env.ADMIN_PIN) {
      console.log('✅ Login exitoso');
      res.json({ success: true, message: 'Login exitoso' });
    } else {
      console.log('❌ PIN incorrecto');
      res.status(401).json({ error: 'PIN incorrecto' });
    }
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// ========================================
// RUTAS DE CONFIGURACIÓN
// ========================================

// GET /api/configuracion - Obtener configuración
app.get('/api/configuracion', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM configuracion LIMIT 1');
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
});

// PUT /api/configuracion - Actualizar configuración
app.put('/api/configuracion', authMiddleware, async (req, res) => {
  try {
    const { nombre_negocio, ubicacion, latitud, longitud, telefono, telefono_whatsapp, horarios, mensaje_whatsapp } = req.body;

    const result = await pool.query(`
      UPDATE configuracion 
      SET nombre_negocio = $1, 
          ubicacion = $2, 
          latitud = $3, 
          longitud = $4, 
          telefono = $5, 
          telefono_whatsapp = $6, 
          horarios = $7,
          mensaje_whatsapp = $8
      WHERE id = 1 
      RETURNING *
    `, [nombre_negocio, ubicacion, latitud, longitud, telefono, telefono_whatsapp, horarios, mensaje_whatsapp]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }

    res.json({ message: 'Configuración actualizada exitosamente', configuracion: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
});

// ========================================
// RUTAS DE CATEGORÍAS
// ========================================

// GET /api/categorias - Obtener todas
app.get('/api/categorias', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categorias ORDER BY orden ASC, id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// POST /api/categorias - Crear
app.post('/api/categorias', authMiddleware, async (req, res) => {
  try {
    const { nombre, descripcion, icono, color, orden } = req.body;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    const result = await pool.query(
      'INSERT INTO categorias (nombre, descripcion, icono, color, orden) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre.trim(), descripcion || '', icono || '🏷️', color || 'blue', orden || 0]
    );

    res.status(201).json({ message: 'Categoría creada exitosamente', categoria: result.rows[0] });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
    }
    res.status(500).json({ error: 'Error al crear categoría' });
  }
});

// PUT /api/categorias/:id - Actualizar
app.put('/api/categorias/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, icono, color, orden } = req.body;

    const result = await pool.query(
      'UPDATE categorias SET nombre = $1, descripcion = $2, icono = $3, color = $4, orden = $5 WHERE id = $6 RETURNING *',
      [nombre, descripcion, icono, color, orden, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json({ message: 'Categoría actualizada exitosamente', categoria: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
});

// DELETE /api/categorias/:id - Eliminar
app.delete('/api/categorias/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM categorias WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json({ message: 'Categoría eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
});

// ========================================
// RUTAS DE PROMOCIONES
// ========================================

// GET /api/promociones - Obtener todas
// IMPORTANTE: Admin SIEMPRE ve todas, público solo las visibles
app.get('/api/promociones', async (req, res) => {
  try {
    // Verificar si la petición viene del admin
    const isAdmin = req.headers['x-authenticated'] === 'true';
    
    console.log('📊 GET promociones - isAdmin:', isAdmin);
    
    let query = `
      SELECT p.*, c.nombre as categoria_nombre, c.icono as categoria_icono, c.color as categoria_color
      FROM promociones p
      LEFT JOIN categorias c ON p.categoria_id = c.id
    `;
    
    // SOLO filtrar si NO es admin
    if (!isAdmin) {
      query += ` WHERE p.visible = true`;
      console.log('👥 Usuario público - Solo mostrando visibles');
    } else {
      console.log('👨‍💼 Admin - Mostrando TODAS las promociones');
    }
    
    query += ` ORDER BY p.orden ASC, p.created_at DESC`;
    
    const result = await pool.query(query);
    console.log(`✅ Devolviendo ${result.rows.length} promociones`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener promociones:', error);
    res.status(500).json({ error: 'Error al obtener promociones' });
  }
});

// GET /api/promociones/categoria/:categoriaId
app.get('/api/promociones/categoria/:categoriaId', async (req, res) => {
  try {
    const { categoriaId } = req.params;
    const isAdmin = req.headers['x-authenticated'] === 'true';
    
    let query = 'SELECT * FROM promociones WHERE categoria_id = $1';
    
    // Si no es admin, solo mostrar las visibles
    if (!isAdmin) {
      query += ' AND visible = true';
    }
    
    query += ' ORDER BY orden ASC, created_at DESC';
    
    const result = await pool.query(query, [categoriaId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener promociones:', error);
    res.status(500).json({ error: 'Error al obtener promociones' });
  }
});

// ⭐ NUEVO ENDPOINT: PUT /api/promociones/reordenar - Actualizar orden
app.put('/api/promociones/reordenar', authMiddleware, async (req, res) => {
  try {
    const { promociones } = req.body;

    if (!Array.isArray(promociones) || promociones.length === 0) {
      return res.status(400).json({ error: 'Datos inválidos' });
    }

    console.log('🔄 Reordenando promociones:', promociones);

    // Usar transacción para asegurar consistencia
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const promo of promociones) {
        await client.query(
          'UPDATE promociones SET orden = $1 WHERE id = $2',
          [promo.orden, promo.id]
        );
      }

      await client.query('COMMIT');
      console.log('✅ Orden actualizado exitosamente');
      res.json({ message: 'Orden actualizado exitosamente' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Error al reordenar promociones:', error);
    res.status(500).json({ error: 'Error al reordenar promociones' });
  }
});

// ⭐ NUEVO ENDPOINT: PUT /api/promociones/:id/toggle-visible - Ocultar/Mostrar promoción
app.put('/api/promociones/:id/toggle-visible', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener el estado actual
    const currentPromo = await pool.query('SELECT visible FROM promociones WHERE id = $1', [id]);

    if (currentPromo.rows.length === 0) {
      return res.status(404).json({ error: 'Promoción no encontrada' });
    }

    // Invertir el estado visible
    const newVisible = !currentPromo.rows[0].visible;

    const result = await pool.query(
      'UPDATE promociones SET visible = $1 WHERE id = $2 RETURNING *',
      [newVisible, id]
    );

    console.log(`✅ Promoción ${id} ahora está ${newVisible ? 'visible' : 'oculta'}`);
    res.json({ 
      message: `Promoción ${newVisible ? 'mostrada' : 'ocultada'} exitosamente`, 
      promocion: result.rows[0] 
    });
  } catch (error) {
    console.error('❌ Error al cambiar visibilidad:', error);
    res.status(500).json({ error: 'Error al cambiar visibilidad' });
  }
});

// POST /api/promociones - Crear
app.post('/api/promociones', authMiddleware, upload.single('imagen'), async (req, res) => {
  try {
    const { titulo, descripcion, categoria_id } = req.body;
    const file = req.file;

    if (!titulo || titulo.trim() === '') {
      return res.status(400).json({ error: 'El título es obligatorio' });
    }

    if (!file) {
      return res.status(400).json({ error: 'La imagen es obligatoria' });
    }

    // Subir imagen a Cloudinary
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'minimercado_promociones', resource_type: 'image' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(file.buffer);
    });

    const cloudinaryResult = await uploadPromise;

    // Insertar en base de datos (orden se establece automáticamente en 0)
    const dbResult = await pool.query(
      'INSERT INTO promociones (titulo, descripcion, imagen_url, cloudinary_id, categoria_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [titulo.trim(), descripcion || '', cloudinaryResult.secure_url, cloudinaryResult.public_id, categoria_id || null]
    );

    res.status(201).json({ message: 'Promoción creada exitosamente', promocion: dbResult.rows[0] });
  } catch (error) {
    console.error('Error al crear promoción:', error);
    res.status(500).json({ error: 'Error al crear promoción' });
  }
});

// PUT /api/promociones/:id - Actualizar
app.put('/api/promociones/:id', authMiddleware, upload.single('imagen'), async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, categoria_id } = req.body;
    const file = req.file;

    const currentPromo = await pool.query('SELECT * FROM promociones WHERE id = $1', [id]);

    if (currentPromo.rows.length === 0) {
      return res.status(404).json({ error: 'Promoción no encontrada' });
    }

    let imagenUrl = currentPromo.rows[0].imagen_url;
    let cloudinaryId = currentPromo.rows[0].cloudinary_id;

    if (file) {
      await cloudinary.uploader.destroy(currentPromo.rows[0].cloudinary_id);

      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'minimercado_promociones', resource_type: 'image' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });

      const cloudinaryResult = await uploadPromise;
      imagenUrl = cloudinaryResult.secure_url;
      cloudinaryId = cloudinaryResult.public_id;
    }

    const nuevoTitulo = titulo && titulo.trim() !== '' ? titulo.trim() : currentPromo.rows[0].titulo;
    const nuevaDescripcion = descripcion !== undefined ? descripcion : currentPromo.rows[0].descripcion;
    const nuevaCategoria = categoria_id !== undefined ? categoria_id : currentPromo.rows[0].categoria_id;
    
    const result = await pool.query(
      'UPDATE promociones SET titulo = $1, descripcion = $2, imagen_url = $3, cloudinary_id = $4, categoria_id = $5 WHERE id = $6 RETURNING *',
      [nuevoTitulo, nuevaDescripcion, imagenUrl, cloudinaryId, nuevaCategoria, id]
    );

    res.json({ message: 'Promoción actualizada exitosamente', promocion: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar promoción:', error);
    res.status(500).json({ error: 'Error al actualizar promoción' });
  }
});

// DELETE /api/promociones/:id - Eliminar
app.delete('/api/promociones/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM promociones WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Promoción no encontrada' });
    }

    const promocion = result.rows[0];

    await cloudinary.uploader.destroy(promocion.cloudinary_id);
    await pool.query('DELETE FROM promociones WHERE id = $1', [id]);

    res.json({ message: 'Promoción eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar promoción:', error);
    res.status(500).json({ error: 'Error al eliminar promoción' });
  }
});

// ========================================
// RUTAS GENERALES
// ========================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// ========================================
// INICIAR SERVIDOR
// ========================================

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 http://localhost:${PORT}`);
  });
}).catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
