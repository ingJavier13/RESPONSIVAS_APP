// archivo: middleware/verifyToken.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"

  if (token == null) return res.sendStatus(401); // No hay token

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Token inválido o expirado
    req.user = user;
    next(); // Pasa al siguiente middleware o a la ruta
  });
}

module.exports = verifyToken;