// archivo: routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Compara el usuario con el guardado en .env
    const isValidUser = username === process.env.ADMIN_USER;
    if (!isValidUser) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // 2. Compara la contraseña con el hash guardado en .env
    const isValidPassword = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // 3. Si todo es correcto, crea un token
    const token = jwt.sign(
      { userId: 1, username: process.env.ADMIN_USER }, // Payload del token
      process.env.JWT_SECRET, // Tu clave secreta
      { expiresIn: '8h' } // El token expira en 8 horas
    );

    res.json({ token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;