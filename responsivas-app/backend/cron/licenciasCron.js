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
        const result = await pool.query(`
            SELECT * FROM licencias 
            WHERE estado = 'activo' 
            AND fecha_vencimiento <= CURRENT_DATE + INTERVAL '5 days'
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
                            <th>Servicio</th>
                            <th>Proveedor</th>
                            <th>Frecuencia</th>
                            <th>Fecha de Vencimiento</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            licenciasPorVencer.forEach(lic => {
                htmlContent += `
                    <tr>
                        <td>${lic.servicio}</td>
                        <td>${lic.proveedor}</td>
                        <td>${lic.frecuencia_pago}</td>
                        <td>${new Date(lic.fecha_vencimiento).toLocaleDateString()}</td>
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
