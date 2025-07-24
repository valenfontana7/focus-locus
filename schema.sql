-- FocusLocus Database Schema for Supabase
-- Este archivo contiene las tablas y políticas de seguridad para la aplicación

-- Habilitar Row Level Security (RLS)
-- Esto asegura que los usuarios solo vean sus propios datos

-- 1. Tabla de Proyectos
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1', -- Color del proyecto (hex)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Índices para mejor performance
  UNIQUE(user_id, name) -- Un usuario no puede tener proyectos con el mismo nombre
);

-- 2. Tabla de Tareas
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Datos de la tarea
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT CHECK (status IN ('pendientes', 'enCurso', 'terminadas')) DEFAULT 'pendientes',
  priority TEXT CHECK (priority IN ('baja', 'normal', 'media', 'alta')) DEFAULT 'normal',
  due_date DATE,
  fecha_hora TIMESTAMPTZ, -- Campo para fecha y hora específica
  
  -- Orden para drag & drop
  position INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 3. Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_position ON tasks(position);

-- 4. Triggers para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Row Level Security (RLS) Policies
-- Esto asegura que cada usuario solo vea sus propios datos

-- Habilitar RLS en las tablas
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Políticas para la tabla projects
CREATE POLICY "Users can view their own projects" ON projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para la tabla tasks
CREATE POLICY "Users can view their own tasks" ON tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON tasks
    FOR DELETE USING (auth.uid() = user_id);

-- 6. Funciones útiles para la aplicación

-- Función para obtener todas las tareas de un proyecto agrupadas por estado
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

-- 7. Comentarios explicativos
COMMENT ON TABLE projects IS 'Proyectos de los usuarios con información básica';
COMMENT ON TABLE tasks IS 'Tareas asociadas a proyectos con estado, prioridad y posición';
COMMENT ON FUNCTION get_project_tasks_grouped IS 'Obtiene todas las tareas de un proyecto agrupadas por estado (pendientes, enCurso, terminadas)';

-- 8. Valores de ejemplo (solo para desarrollo)
-- Descomentar solo si quieres datos de prueba
/*
INSERT INTO projects (user_id, name, color) VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Mi Primer Proyecto', '#6366f1');

INSERT INTO tasks (project_id, user_id, name, description, status, priority, due_date) VALUES 
  ((SELECT id FROM projects WHERE name = 'Mi Primer Proyecto'), 
   '00000000-0000-0000-0000-000000000000', 
   '¡Bienvenido a FocusLocus!', 
   'Esta es tu primera tarea. Puedes editarla, moverla entre listas o eliminarla.',
   'pendientes', 
   'baja', 
   CURRENT_DATE + INTERVAL '7 days');
*/

-- MIGRACIÓN: Agregar columna fecha_hora si no existe
-- ⚠️  IMPORTANTE: Ejecutar este comando en Supabase SQL Editor si ya tienes una base de datos existente
-- 
-- Pasos para aplicar la migración:
-- 1. Ve a tu proyecto de Supabase (https://app.supabase.com)
-- 2. Ve a la sección "SQL Editor"
-- 3. Ejecuta el siguiente comando:

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS fecha_hora TIMESTAMPTZ;

-- 4. Luego ejecuta este comando para actualizar la función existente:

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
