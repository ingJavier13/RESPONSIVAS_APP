const express = require('express');
const router = express.Router();
const pool = require('../db');

// Obtener todos los tipos de servicio
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tipos_servicio ORDER BY nombre ASC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los tipos de servicio' });
    }
});

// Crear nuevo tipo de servicio
router.post('/', async (req, res) => {
    const { nombre } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO tipos_servicio (nombre) VALUES ($1) RETURNING *',
            [nombre]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el tipo de servicio' });
    }
});

// Actualizar tipo de servicio
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    try {
        const result = await pool.query(
            'UPDATE tipos_servicio SET nombre=$1 WHERE id=$2 RETURNING *',
            [nombre, id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Tipo de servicio no encontrado' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el tipo de servicio' });
    }
});

// Eliminar tipo de servicio
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM tipos_servicio WHERE id=$1 RETURNING *', [id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Tipo de servicio no encontrado' });
        res.json({ message: 'Tipo de servicio eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        if (error.code === '23503') { // Foreign key violation
            res.status(400).json({ error: 'No se puede eliminar el tipo de servicio porque tiene licencias asociadas.' });
        } else {
            res.status(500).json({ error: 'Error al eliminar el tipo de servicio' });
        }
    }
});

module.exports = router;
