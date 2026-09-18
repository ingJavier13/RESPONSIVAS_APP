-- 1. Crear tabla de proveedores
CREATE TABLE proveedores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para updated_at (asumiendo que update_updated_at_column ya existe del script anterior)
CREATE TRIGGER update_proveedores_updated_at
    BEFORE UPDATE ON proveedores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 2. Migrar los proveedores únicos existentes desde la tabla licencias
INSERT INTO proveedores (nombre)
SELECT DISTINCT proveedor 
FROM licencias 
WHERE proveedor IS NOT NULL AND proveedor != '';

-- 3. Añadir la columna proveedor_id a licencias
ALTER TABLE licencias ADD COLUMN proveedor_id INTEGER;

-- 4. Actualizar los registros de licencias con el ID correspondiente del proveedor
UPDATE licencias l
SET proveedor_id = p.id
FROM proveedores p
WHERE l.proveedor = p.nombre;

-- 5. Hacer que proveedor_id sea NOT NULL (opcional, pero recomendado si es obligatorio)
ALTER TABLE licencias ALTER COLUMN proveedor_id SET NOT NULL;

-- 6. Crear la llave foránea
ALTER TABLE licencias 
ADD CONSTRAINT fk_licencias_proveedor 
FOREIGN KEY (proveedor_id) 
REFERENCES proveedores(id) 
ON DELETE RESTRICT;

-- 7. Eliminar la columna de texto original
ALTER TABLE licencias DROP COLUMN proveedor;
