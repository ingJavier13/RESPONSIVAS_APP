// archivo: routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Se Compara el usuario con el guardado en .env
    const isEnvUser = username === process.env.ADMIN_USER;

    if (isEnvUser) {
      // Se Compara la contraseña con el hash guardado en .env
      const isValidPassword = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
      }

      // Si todo esta correcto, crea un token
      const token = jwt.sign(
        { userId: 'admin-env', username: process.env.ADMIN_USER }, // Payload del token
        process.env.JWT_SECRET, // Tu clave secreta
        { expiresIn: '8h' } // El token expira en 8 horas
      );

      return res.json({ token });
    }

    // Si no es el usuario del .env, buscar en la base de datos
    const userResult = await pool.query('SELECT * FROM usuarios WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const dbUser = userResult.rows[0];
    const isValidDbPassword = await bcrypt.compare(password, dbUser.password_hash);
    if (!isValidDbPassword) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { userId: dbUser.id, username: dbUser.username }, 
      process.env.JWT_SECRET, 
      { expiresIn: '8h' } 
    );

    return res.json({ token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;