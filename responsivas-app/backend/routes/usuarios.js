const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');

// GET /api/usuarios
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, username, permisos FROM usuarios ORDER BY username ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener usuarios:', err);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

// POST /api/usuarios
router.post('/', async (req, res) => {
    const { username, password, permisos } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'El nombre de usuario y contraseña son obligatorios' });
    }
    
    try {
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        const permisosStr = permisos || '';

        const result = await pool.query(
            'INSERT INTO usuarios (username, password_hash, permisos) VALUES ($1, $2, $3) RETURNING id, username, permisos',
            [username.trim(), passwordHash, permisosStr]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') { // unique_violation
            return res.status(400).json({ error: 'El usuario ya existe' });
        }
        console.error('Error al crear usuario:', err);
        res.status(500).json({ error: 'Error al crear usuario' });
    }
});

// PUT /api/usuarios/:id
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { username, password, permisos } = req.body;

    if (!username) {
        return res.status(400).json({ error: 'El nombre de usuario es obligatorio' });
    }

    try {
        const permisosStr = permisos || '';
        if (password && password.trim() !== '') {
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);
            
            const result = await pool.query(
                'UPDATE usuarios SET username = $1, password_hash = $2, permisos = $3 WHERE id = $4 RETURNING id, username, permisos',
                [username.trim(), passwordHash, permisosStr, id]
            );
            if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
            res.json(result.rows[0]);
        } else {
            const result = await pool.query(
                'UPDATE usuarios SET username = $1, permisos = $2 WHERE id = $3 RETURNING id, username, permisos',
                [username.trim(), permisosStr, id]
            );
            if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
            res.json(result.rows[0]);
        }
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
        }
        console.error('Error al actualizar usuario:', err);
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
});

// DELETE /api/usuarios/:id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json({ mensaje: 'Usuario eliminado' });
    } catch (err) {
        console.error('Error al eliminar usuario:', err);
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
});

module.exports = router;
