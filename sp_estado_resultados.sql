-- =============================================================
-- Stored Procedure: sp_estado_resultados
-- Fecha: 2026-04-25
-- Descripción: Calcula el estado de resultados consolidado
--   para todos los pedidos activos (excluye cancelados/devueltos).
--   Retorna una sola fila con ventas brutas, descuentos,
--   ventas netas, costo de ventas, utilidad bruta y margen bruto %.
-- =============================================================

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_estado_resultados$$

CREATE PROCEDURE sp_estado_resultados()
BEGIN

  SELECT
    COALESCE(SUM(pi.subtotal), 0)
      AS ventas_brutas,

    COALESCE(SUM(
      CASE
        WHEN d.tipo = 'porcentaje'
          THEN pi.subtotal * (d.valor / 100)
        WHEN d.tipo = 'fijo'
          THEN LEAST(d.valor, pi.subtotal)
        ELSE 0
      END
    ), 0)
      AS descuentos_aplicados,

    COALESCE(SUM(pi.subtotal), 0) - COALESCE(SUM(
      CASE
        WHEN d.tipo = 'porcentaje'
          THEN pi.subtotal * (d.valor / 100)
        WHEN d.tipo = 'fijo'
          THEN LEAST(d.valor, pi.subtotal)
        ELSE 0
      END
    ), 0)
      AS ventas_netas,

    COALESCE(SUM(pi.cantidad * p.precio_costo), 0)
      AS costo_de_ventas,

    (
      COALESCE(SUM(pi.subtotal), 0) - COALESCE(SUM(
        CASE
          WHEN d.tipo = 'porcentaje'
            THEN pi.subtotal * (d.valor / 100)
          WHEN d.tipo = 'fijo'
            THEN LEAST(d.valor, pi.subtotal)
          ELSE 0
        END
      ), 0)
    ) - COALESCE(SUM(pi.cantidad * p.precio_costo), 0)
      AS utilidad_bruta,

    ROUND(
      IF(SUM(pi.subtotal) = 0 OR SUM(pi.subtotal) IS NULL, 0,
        (
          (
            COALESCE(SUM(pi.subtotal), 0) - COALESCE(SUM(
              CASE
                WHEN d.tipo = 'porcentaje'
                  THEN pi.subtotal * (d.valor / 100)
                WHEN d.tipo = 'fijo'
                  THEN LEAST(d.valor, pi.subtotal)
                ELSE 0
              END
            ), 0)
          ) - COALESCE(SUM(pi.cantidad * p.precio_costo), 0)
        ) / SUM(pi.subtotal) * 100
      )
    , 2)
      AS margen_bruto_pct

  FROM      pedidos       pe
  JOIN      pedido_items  pi  ON pi.pedido_id  = pe.id
  JOIN      productos     p   ON p.id          = pi.producto_id
  LEFT JOIN descuentos    d   ON d.id          = pe.descuento_id

  WHERE
    pe.estado NOT IN ('cancelado', 'devuelto');

END$$

DELIMITER ;

-- Ejecución:
-- CALL sp_estado_resultados();
