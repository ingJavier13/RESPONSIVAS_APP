const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');

// Crear una nueva responsiva
router.post('/', async (req, res) => {
    try {
     const { ciudad, fecha, responsable, empresa, tipoEquipo, marca, modelo, numeroSerie, accesorios, estado, responsableArea } = req.body;
     const result = await pool.query(
    `INSERT INTO responsivas (ciudad, fecha, responsable, empresa, tipo_equipo, marca, modelo, numero_serie, accesorios, estado, responsable_area) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
     [ciudad, fecha, responsable, empresa, tipoEquipo, marca, modelo, numeroSerie, accesorios, estado, responsableArea]
   );
   res.status(201).json(result.rows[0]);
  } catch (err) {
   console.error(err);
   res.status(500).json({ error: 'Error al guardar la responsiva' });
   }
});


// Obtener todas las responsivas (Actualizada con búsqueda)
// --- RUTA GET / CON CONSOLE.LOG ---
router.get('/', async (req, res) => {
  const search = req.query.search || '';
  console.log(`\n--- Petición GET /api/responsivas ---`); // Log 1: Inicio
  console.log(`Término de búsqueda recibido: "${search}"`); // Log 2: Ver el término

  try {
    let query = 'SELECT * FROM responsivas';
    let queryParams = [];

    if (search) {
      console.log('Aplicando filtro WHERE...'); // Log 3: Confirma que entra al IF
      query += ` WHERE responsable ILIKE $1 OR tipo_equipo ILIKE $1 OR marca ILIKE $1 OR modelo ILIKE $1 OR numero_serie ILIKE $1`;
      queryParams.push(`%${search}%`);
    } else {
      console.log('No se aplica filtro WHERE.'); // Log 4: Confirma si NO entra al IF
    }

    query += ' ORDER BY created_at DESC';

    console.log("Consulta SQL final:", query); // Log 5: Ver la consulta completa
    console.log("Parámetros:", queryParams); // Log 6: Ver los parámetros

    const result = await pool.query(query, queryParams);
    console.log(`Resultados encontrados: ${result.rows.length}`); // Log 7: Ver cuántos devolvió
    console.log('---------------------------------');

    res.json(result.rows);

  } catch (err) {
    console.error('¡ERROR EN GET /api/responsivas!:', err); // Log de error
    res.status(500).json({ error: 'Error al obtener las responsivas' });
  }
});
// --- FIN DE LA RUTA ---
// --- FIN DE LA MODIFICACIÓN ---


// Eliminar una responsiva por ID
router.delete('/:id', async (req, res) => { 
    try {
     const { id } = req.params;
     await pool.query('DELETE FROM responsivas WHERE id = $1', [id]);
      res.status(200).json({ mensaje: 'Responsiva eliminada' });
   } catch (err) {
   console.error(err);
   res.status(500).json({ error: 'Error al eliminar la responsiva' });
  }
});

// Configuración de Multer (sin cambios)
const storage = multer.diskStorage({ /* ... */ });
const upload = multer({ storage });

// Subir archivo PDF firmado
router.post('/upload', upload.single('archivo'), async (req, res) => {
  const { id } = req.body;
  const archivo = req.file?.filename;
    try {
      await pool.query('UPDATE responsivas SET archivo_pdf = $1 WHERE id = $2', [archivo, id]);
      res.json({ mensaje: 'Archivo guardado', archivo });
    } catch (err) {
     console.error(err);
   res.status(500).json({ error: 'Error al guardar el archivo' });
  }
});

// Obtener lista simplificada de responsivas (para selects, etc.)
router.get('/lista', async (req, res) => { 
       try {
      const result = await pool.query('SELECT id, responsable, fecha FROM responsivas ORDER BY fecha DESC');
     res.json(result.rows);
    } catch (err) {
   console.error(err);
  res.status(500).json({ error: 'Error al obtener la lista de responsivas' });
 }
});


// Modulo de KPIs
// GET /api/responsivas/kpis/stats
router.get('/kpis/stats', async (req, res) => {
  try {
    const totalQuery = "SELECT COUNT(*) as total FROM responsivas";
    const faltantesQuery = "SELECT COUNT(*) as faltantes FROM responsivas WHERE archivo_pdf IS NULL";
    
    const totalResult = await pool.query(totalQuery);
    const faltantesResult = await pool.query(faltantesQuery);

    const stats = {
      total: totalResult.rows[0].total,
      faltantes: faltantesResult.rows[0].faltantes,
    };

    res.json(stats);
  } catch (error) {
    console.error('Error detallado en KPIs stats:', error);
    res.status(500).json({ error: 'Error al obtener las estadísticas' });
  }
});

// GET /api/responsivas/kpis/reciente
router.get('/kpis/reciente', async (req, res) => {
  try {
    const recienteQuery = "SELECT * FROM responsivas ORDER BY id DESC LIMIT 1";
    
    const recienteResult = await pool.query(recienteQuery);

    res.json(recienteResult.rows[0] || {}); 
  } catch (error) {
    console.error('Error detallado en KPI reciente:', error);
    res.status(500).json({ error: 'Error al obtener la última responsiva' });
  }
});


module.exports = router;