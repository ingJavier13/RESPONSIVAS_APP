const express = require('express');
const router = express.Router();
const pool = require('../db');

// Obtener todos los proveedores
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM proveedores ORDER BY nombre ASC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los proveedores' });
    }
});

// Crear nuevo proveedor
router.post('/', async (req, res) => {
    const { nombre } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO proveedores (nombre) VALUES ($1) RETURNING *',
            [nombre]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el proveedor' });
    }
});

// Actualizar proveedor
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    try {
        const result = await pool.query(
            'UPDATE proveedores SET nombre=$1 WHERE id=$2 RETURNING *',
            [nombre, id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Proveedor no encontrado' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el proveedor' });
    }
});

// Eliminar proveedor
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM proveedores WHERE id=$1 RETURNING *', [id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Proveedor no encontrado' });
        res.json({ message: 'Proveedor eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        if (error.code === '23503') { // Foreign key violation en PostgreSQL
            res.status(400).json({ error: 'No se puede eliminar el proveedor porque tiene licencias asociadas.' });
        } else {
            res.status(500).json({ error: 'Error al eliminar el proveedor' });
        }
    }
});

module.exports = router;
