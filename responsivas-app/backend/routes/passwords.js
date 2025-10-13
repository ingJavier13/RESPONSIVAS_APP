// archivo: routes/passwords.js

const express = require('express');
const router = express.Router();
const pool = require('../db');
const crypto = require('crypto');
require('dotenv').config();

// --- Configuración de Cifrado ---
const algorithm = 'aes-256-cbc';
// Asegúrate de que tu .env tenga una LLAVE HEXADECIMAL de 64 caracteres
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

const encrypt = (text) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
};

const decrypt = (text) => {
    try {
        const parts = text.split(':');
        const iv = Buffer.from(parts.shift(), 'hex');
        const encryptedText = Buffer.from(parts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error("Error al descifrar:", error);
        return null; // Devuelve null si hay un error
    }
};

// --- Definición de Rutas ---

// POST /api/passwords (Crear una nueva contraseña)
router.post('/', async (req, res) => {
  const { categoria, servicio_o_usuario, contrasena, descripcion } = req.body;
  try {
    const contrasena_cifrada = encrypt(contrasena);
    const result = await pool.query(
      `INSERT INTO contrasenas (categoria, servicio_o_usuario, contrasena_hash, descripcion) 
       VALUES ($1, $2, $3, $4) RETURNING id, categoria, servicio_o_usuario, descripcion`,
      [categoria, servicio_o_usuario, contrasena_cifrada, descripcion]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al guardar la contraseña:', err);
    res.status(500).json({ error: 'Error al guardar la contraseña' });
  }
});

// GET /api/passwords (Obtener la lista SIN contraseñas)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, categoria, servicio_o_usuario, descripcion, created_at FROM contrasenas ORDER BY categoria, servicio_o_usuario'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener la lista de contraseñas:', err);
    res.status(500).json({ error: 'Error al obtener la lista de contraseñas' });
  }
});

// GET /api/passwords/:id/reveal (Revelar una contraseña específica)
router.get('/:id/reveal', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT contrasena_hash FROM contrasenas WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No encontrado' });
        }
        const contrasena_cifrada = result.rows[0].contrasena_hash;
        const contrasena_plana = decrypt(contrasena_cifrada);
        res.json({ password: contrasena_plana });
    } catch (err) {
        console.error('Error al revelar la contraseña:', err);
        res.status(500).json({ error: 'No se pudo descifrar la contraseña' });
    }
});

// DELETE /api/passwords/:id (Eliminar una contraseña)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM contrasenas WHERE id = $1', [id]);
    res.status(200).json({ mensaje: 'Registro eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar:', err);
    res.status(500).json({ error: 'Error al eliminar el registro' });
  }
});

// GET /api/passwords/kpis/reciente
router.get('/kpis/reciente', async (req, res) => {
  try {
    // La columna 'created_at' es ideal para saber cuál es la más nueva
    const recienteQuery = "SELECT * FROM contrasenas ORDER BY created_at DESC LIMIT 1";
    
    const recienteResult = await pool.query(recienteQuery);

    // Devuelve el primer resultado o un objeto vacío si no hay ninguno
    res.json(recienteResult.rows[0] || {}); 
  } catch (error) {
    console.error('Error detallado en KPI reciente de contraseñas:', error);
    res.status(500).json({ error: 'Error al obtener la última contraseña' });
  }
});

// GET /api/passwords/:id (Obtener un registro por su ID)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, categoria, servicio_o_usuario, descripcion FROM contrasenas WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener el registro:', err);
    res.status(500).json({ error: 'Error al obtener el registro' });
  }
});

// PUT /api/passwords/:id (Actualizar un registro)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { categoria, servicio_o_usuario, contrasena, descripcion } = req.body;

  try {
    let contrasena_cifrada;
    // Si el usuario envió una nueva contraseña (no es una cadena vacía), la ciframos.
    if (contrasena) {
      contrasena_cifrada = encrypt(contrasena);
      await pool.query(
        `UPDATE contrasenas SET categoria = $1, servicio_o_usuario = $2, contrasena_hash = $3, descripcion = $4 WHERE id = $5`,
        [categoria, servicio_o_usuario, contrasena_cifrada, descripcion, id]
      );
    } else {
      // Si no envió una nueva contraseña, actualizamos todo excepto la contraseña.
      await pool.query(
        `UPDATE contrasenas SET categoria = $1, servicio_o_usuario = $2, descripcion = $3 WHERE id = $4`,
        [categoria, servicio_o_usuario, descripcion, id]
      );
    }
    
    // Devolvemos el objeto actualizado (sin la contraseña)
    const updatedResult = await pool.query('SELECT id, categoria, servicio_o_usuario, descripcion FROM contrasenas WHERE id = $1', [id]);
    res.status(200).json(updatedResult.rows[0]);
  } catch (err) {
    console.error('Error al actualizar el registro:', err);
    res.status(500).json({ error: 'Error al actualizar el registro' });
  }
});


// --- LÍNEA ESENCIAL AL FINAL DEL ARCHIVO ---
module.exports = router;