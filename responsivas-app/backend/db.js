//conexion a la base de datos PostgreSQL usando variables de entorno
const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool()

module.exports = pool