const cron = require('node-cron');
const nodemailer = require('nodemailer');
const pool = require('../db');
require('dotenv').config();

// Configurar el transportador de nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == '465', // true para 465, false para otros puertos
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    }
});

// Tarea programada: Ejecutar todos los días a las 08:00 AM
cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Verificando licencias por vencer...');
    try {
            SELECT l.*, p.nombre as proveedor_nombre, ts.nombre as tipo_servicio_nombre 
            FROM licencias l
            LEFT JOIN proveedores p ON l.proveedor_id = p.id
            LEFT JOIN tipos_servicio ts ON l.tipo_servicio_id = ts.id
            WHERE l.estado = 'activo' 
            AND l.fecha_vencimiento <= CURRENT_DATE + INTERVAL '5 days'
        `);

        const licenciasPorVencer = result.rows;

        if (licenciasPorVencer.length > 0) {
            console.log(`[CRON] Se encontraron ${licenciasPorVencer.length} licencias próximas a vencer. Enviando correo...`);
            
            let htmlContent = `
                <h2>Alerta de Licencias por Vencer</h2>
                <p>Las siguientes licencias y suscripciones están a punto de expirar en los próximos 5 días (o ya expiraron):</p>
                <table border="1" cellpadding="10" cellspacing="0">
                    <thead>
                        <tr>
                            <th style="padding: 10px; border-bottom: 2px solid #cbd5e1; text-align: left;">Servicio</th>
                            <th style="padding: 10px; border-bottom: 2px solid #cbd5e1; text-align: left;">Tipo</th>
                            <th style="padding: 10px; border-bottom: 2px solid #cbd5e1; text-align: left;">Proveedor</th>
                            <th style="padding: 10px; border-bottom: 2px solid #cbd5e1; text-align: left;">Frecuencia</th>
                            <th style="padding: 10px; border-bottom: 2px solid #cbd5e1; text-align: left;">Fecha de Vencimiento</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            licenciasPorVencer.forEach(lic => {
                htmlContent += `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${lic.servicio}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${lic.tipo_servicio_nombre || 'N/A'}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${lic.proveedor_nombre}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-transform: capitalize;">${lic.frecuencia_pago}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #b91c1c;">
                            ${new Date(lic.fecha_vencimiento).toLocaleDateString()}
                        </td>
                    </tr>
                `;
            });

            htmlContent += `
                    </tbody>
                </table>
                <br/>
                <p>Por favor, ingresa al sistema para renovarlas.</p>
            `;

            const mailOptions = {
                from: `"Sistema de Licencias" <${process.env.SMTP_USER}>`,
                to: process.env.ALERT_TARGET_EMAIL,
                subject: '⚠️ Alerta: Licencias por Vencer',
                html: htmlContent
            };

            await transporter.sendMail(mailOptions);
            console.log('[CRON] Correo de alerta enviado exitosamente.');
        } else {
            console.log('[CRON] Ninguna licencia próxima a vencer.');
        }

    } catch (error) {
        console.error('[CRON] Error al ejecutar la verificación de licencias:', error);
    }
});
