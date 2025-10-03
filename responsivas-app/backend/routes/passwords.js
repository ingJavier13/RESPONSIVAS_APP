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


// --- LÍNEA ESENCIAL AL FINAL DEL ARCHIVO ---
module.exports = router;