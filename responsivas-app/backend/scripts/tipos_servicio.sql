-- 1. Crear tabla de tipos de servicio
CREATE TABLE tipos_servicio (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para updated_at (asumiendo que update_updated_at_column ya existe)
CREATE TRIGGER update_tipos_servicio_updated_at
    BEFORE UPDATE ON tipos_servicio
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 2. Añadir la columna tipo_servicio_id a licencias
ALTER TABLE licencias ADD COLUMN tipo_servicio_id INTEGER;

-- 3. Crear la llave foránea
ALTER TABLE licencias 
ADD CONSTRAINT fk_licencias_tipo_servicio 
FOREIGN KEY (tipo_servicio_id) 
REFERENCES tipos_servicio(id) 
ON DELETE RESTRICT;

-- Nota: Como los registros anteriores no tenían esta clasificación, 
-- tipo_servicio_id será NULL temporalmente para ellos hasta que se actualicen manualmente.
