const express = require('express');
const router = express.Router();
const pool = require('../db');

// Obtener todas las licencias
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM licencias ORDER BY fecha_vencimiento ASC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las licencias' });
    }
});

// Crear nueva licencia
router.post('/', async (req, res) => {
    const { servicio, proveedor, fecha_vencimiento, frecuencia_pago } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO licencias (servicio, proveedor, fecha_vencimiento, frecuencia_pago) VALUES ($1, $2, $3, $4) RETURNING *',
            [servicio, proveedor, fecha_vencimiento, frecuencia_pago]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la licencia' });
    }
});

// Actualizar licencia
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { servicio, proveedor, fecha_vencimiento, frecuencia_pago, estado } = req.body;
    try {
        const result = await pool.query(
            'UPDATE licencias SET servicio=$1, proveedor=$2, fecha_vencimiento=$3, frecuencia_pago=$4, estado=$5 WHERE id=$6 RETURNING *',
            [servicio, proveedor, fecha_vencimiento, frecuencia_pago, estado, id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Licencia no encontrada' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar la licencia' });
    }
});

// Eliminar licencia
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM licencias WHERE id=$1 RETURNING *', [id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Licencia no encontrada' });
        res.json({ message: 'Licencia eliminada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar la licencia' });
    }
});

// Renovar licencia
router.post('/:id/renovar', async (req, res) => {
    const { id } = req.params;
    try {
        // Obtener la licencia actual
        const licenciaRes = await pool.query('SELECT * FROM licencias WHERE id=$1', [id]);
        if (licenciaRes.rowCount === 0) return res.status(404).json({ error: 'Licencia no encontrada' });
        
        const licencia = licenciaRes.rows[0];
        let nuevaFecha = new Date(licencia.fecha_vencimiento);
        
        if (licencia.frecuencia_pago === 'mensual') {
            nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);
        } else if (licencia.frecuencia_pago === 'anual') {
            nuevaFecha.setFullYear(nuevaFecha.getFullYear() + 1);
        }

        const result = await pool.query(
            'UPDATE licencias SET fecha_vencimiento=$1, estado=$2 WHERE id=$3 RETURNING *',
            [nuevaFecha, 'activo', id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al renovar la licencia' });
    }
});

// KPIs
router.get('/kpis/stats', async (req, res) => {
    try {
        // Licencias por vencer en los próximos 7 días (y que no estén vencidas)
        const porVencer = await pool.query(`
            SELECT COUNT(*) FROM licencias 
            WHERE estado = 'activo' 
            AND fecha_vencimiento <= CURRENT_DATE + INTERVAL '7 days'
            AND fecha_vencimiento >= CURRENT_DATE
        `);
        
        // Licencias vencidas o con fecha pasada
        const vencidas = await pool.query(`
            SELECT COUNT(*) FROM licencias 
            WHERE estado = 'vencido' 
            OR fecha_vencimiento < CURRENT_DATE
        `);

        // Total
        const total = await pool.query('SELECT COUNT(*) FROM licencias');

        res.json({
            porVencer: parseInt(porVencer.rows[0].count),
            vencidas: parseInt(vencidas.rows[0].count),
            total: parseInt(total.rows[0].count)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener KPIs' });
    }
});

module.exports = router;
