-- MIGRACIÓN: Agregar soporte para fecha_hora y actualizar constraint de prioridad
-- 
-- ⚠️  EJECUTAR EN SUPABASE SQL EDITOR
-- 
-- Estos comandos agregan la funcionalidad de fecha y hora específica a las tareas
-- y actualizan el constraint de prioridad para incluir 'media'.
-- Ejecuta estos comandos en tu proyecto de Supabase:
-- 1. Ve a https://app.supabase.com
-- 2. Selecciona tu proyecto
-- 3. Ve a "SQL Editor"
-- 4. Copia y ejecuta los siguientes comandos:

-- 1. Agregar la columna fecha_hora
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS fecha_hora TIMESTAMPTZ;

-- 2. Actualizar el constraint de prioridad para incluir 'media'
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_priority_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_priority_check CHECK (priority IN ('baja', 'normal', 'media', 'alta'));

-- 3. Actualizar la función para incluir fecha_hora
CREATE OR REPLACE FUNCTION get_project_tasks_grouped(project_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'pendientes', COALESCE(
            (SELECT json_agg(
                json_build_object(
                    'id', id,
                    'nombre', name,
                    'descripcion', description,
                    'expira', due_date,
                    'fechaHora', fecha_hora,
                    'prioridad', priority,
                    'position', position
                ) ORDER BY position, created_at
            ) FROM tasks WHERE project_id = project_uuid AND status = 'pendientes'), '[]'::json
        ),
        'enCurso', COALESCE(
            (SELECT json_agg(
                json_build_object(
                    'id', id,
                    'nombre', name,
                    'descripcion', description,
                    'expira', due_date,
                    'fechaHora', fecha_hora,
                    'prioridad', priority,
                    'position', position
                ) ORDER BY position, created_at
            ) FROM tasks WHERE project_id = project_uuid AND status = 'enCurso'), '[]'::json
        ),
        'terminadas', COALESCE(
            (SELECT json_agg(
                json_build_object(
                    'id', id,
                    'nombre', name,
                    'descripcion', description,
                    'expira', due_date,
                    'fechaHora', fecha_hora,
                    'prioridad', priority,
                    'position', position
                ) ORDER BY position, created_at
            ) FROM tasks WHERE project_id = project_uuid AND status = 'terminadas'), '[]'::json
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Verificar que la migración fue exitosa
-- Puedes ejecutar este comando para verificar que la columna existe:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tasks';
