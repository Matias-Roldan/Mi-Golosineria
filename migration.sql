-- =============================================================
-- Migración de índices de rendimiento — mi_golosineria
-- Fecha: 2026-04-22
-- =============================================================

-- 1. FULLTEXT en productos.nombre
--    LIKE '%texto%' con wildcard al inicio no puede usar índices B-Tree
--    (MySQL hace full table scan). FULLTEXT indexa tokens del campo y
--    permite usar MATCH(nombre) AGAINST(...) que sí usa el índice.
--    NOTA: las queries deben cambiarse de LIKE '%x%' a MATCH/AGAINST.
ALTER TABLE productos
  ADD FULLTEXT INDEX idx_ft_nombre (nombre);
-- ↑ Ya ejecutado el 2026-04-22. InnoDB agregó FTS_DOC_ID automáticamente.

-- 2. Índice en pedidos.creado_en
--    Los reportes del dashboard filtran y agrupan por rango de fechas
--    (ej: últimos 30 días). Sin índice, MySQL escanea toda la tabla
--    para encontrar las filas del período. Con él, la búsqueda es O(log n).
--    NOTA: idx_creado_en ya existía en el schema inicial.
-- ALTER TABLE pedidos ADD INDEX idx_creado_en (creado_en);

-- 3. Índice en pedidos.estado
--    El panel admin filtra pedidos por estado (pendiente/confirmado/etc.)
--    con alta frecuencia. Sin índice, cada filtro requiere full scan.
--    Dado que estado tiene cardinalidad baja (4 valores), MySQL puede
--    decidir no usarlo en tablas pequeñas, pero escala bien al crecer.
--    NOTA: idx_estado ya existía en el schema inicial.
-- ALTER TABLE pedidos ADD INDEX idx_estado (estado);
