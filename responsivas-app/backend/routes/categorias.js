const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/categorias
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categorias ORDER BY nombre ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener categorias:', err);
        res.status(500).json({ error: 'Error al obtener categorias' });
    }
});

// POST /api/categorias
router.post('/', async (req, res) => {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
    
    try {
        const result = await pool.query(
            'INSERT INTO categorias (nombre) VALUES ($1) RETURNING *',
            [nombre.toUpperCase()]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') { // unique_violation
            return res.status(400).json({ error: 'La categoría ya existe' });
        }
        console.error('Error al crear categoria:', err);
        res.status(500).json({ error: 'Error al crear categoria' });
    }
});

// PUT /api/categorias/:id
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });

    try {
        const uppercaseName = nombre.toUpperCase();
        
        // Primero obtener el nombre antiguo para actualizar las contraseñas
        const catResult = await pool.query('SELECT nombre FROM categorias WHERE id = $1', [id]);
        if (catResult.rows.length === 0) return res.status(404).json({ error: 'Categoría no encontrada' });
        
        const nombreAntiguo = catResult.rows[0].nombre;

        // Iniciar transacción
        await pool.query('BEGIN');
        
        // Actualizar la categoría
        const updateResult = await pool.query(
            'UPDATE categorias SET nombre = $1 WHERE id = $2 RETURNING *',
            [uppercaseName, id]
        );
        
        // Actualizar las contraseñas que usaban este nombre de categoría
        await pool.query(
            'UPDATE contrasenas SET categoria = $1 WHERE categoria = $2',
            [uppercaseName, nombreAntiguo]
        );
        
        await pool.query('COMMIT');
        
        res.json(updateResult.rows[0]);
    } catch (err) {
        await pool.query('ROLLBACK');
        if (err.code === '23505') {
            return res.status(400).json({ error: 'La categoría ya existe' });
        }
        console.error('Error al actualizar categoria:', err);
        res.status(500).json({ error: 'Error al actualizar categoria' });
    }
});

// DELETE /api/categorias/:id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Verificar si hay contraseñas usando esta categoría
        const catResult = await pool.query('SELECT nombre FROM categorias WHERE id = $1', [id]);
        if (catResult.rows.length === 0) return res.status(404).json({ error: 'Categoría no encontrada' });
        
        const nombre = catResult.rows[0].nombre;
        
        const countResult = await pool.query('SELECT count(*) FROM contrasenas WHERE categoria = $1', [nombre]);
        if (parseInt(countResult.rows[0].count) > 0) {
            return res.status(400).json({ error: 'No se puede eliminar la categoría porque está en uso por algunas contraseñas' });
        }

        await pool.query('DELETE FROM categorias WHERE id = $1', [id]);
        res.json({ mensaje: 'Categoría eliminada' });
    } catch (err) {
        console.error('Error al eliminar categoria:', err);
        res.status(500).json({ error: 'Error al eliminar categoria' });
    }
});

module.exports = router;
