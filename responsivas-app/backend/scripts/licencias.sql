-- Script para crear la tabla de Licencias / Suscripciones

CREATE TABLE licencias (
    id SERIAL PRIMARY KEY,
    servicio VARCHAR(255) NOT NULL,
    proveedor VARCHAR(255) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    frecuencia_pago VARCHAR(50) NOT NULL CHECK (frecuencia_pago IN ('mensual', 'anual')),
    estado VARCHAR(50) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'vencido')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_licencias_updated_at
    BEFORE UPDATE ON licencias
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
