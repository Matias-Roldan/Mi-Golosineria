# Referencia de Base de Datos — mi_golosineria
> Motor: MySQL 8.0 · Charset: utf8mb4_unicode_ci

---

## TABLAS

### `auditoria`
Registra cambios automáticos sobre otras tablas (via triggers).

| Columna | Tipo | Notas |
|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| `tabla` | VARCHAR(100) | Nombre de la tabla afectada |
| `accion` | ENUM | `'INSERT'`, `'UPDATE'`, `'DELETE'` |
| `registro_id` | INT UNSIGNED | ID del registro afectado |
| `datos_anteriores` | JSON | Estado previo (puede ser NULL) |
| `datos_nuevos` | JSON | Estado nuevo (puede ser NULL) |
| `usuario_admin_id` | INT UNSIGNED | FK → `usuarios_admin.id` (nullable) |
| `ip_origen` | VARCHAR(45) | IP de quien hizo el cambio (nullable) |
| `creado_en` | DATETIME | DEFAULT CURRENT_TIMESTAMP |

**Índices:** `idx_tabla_registro (tabla, registro_id)`, `idx_creado_en`, `idx_admin`

---

### `categorias`
Categorías de productos (Chicles, Chocolates, Alfajores, etc.).

| Columna | Tipo | Notas |
|---|---|---|
| `id` | INT UNSIGNED | PK, AUTO_INCREMENT |
| `nombre` | VARCHAR(100) | UNIQUE |
| `activa` | TINYINT(1) | DEFAULT 1 |
| `creado_en` | DATETIME | DEFAULT CURRENT_TIMESTAMP |

**Datos actuales:** Chicles, Chocolates, Caramelos, Alfajores, Snacks Salados, Bebidas, Turrones, Galletitas, Pascua, Promociones

---

### `clientes`
Clientes que realizan pedidos.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | INT UNSIGNED | PK, AUTO_INCREMENT |
| `nombre` | VARCHAR(150) | |
| `telefono` | VARCHAR(30) | UNIQUE |
| `email` | VARCHAR(150) | UNIQUE, nullable |
| `direccion` | VARCHAR(255) | nullable |
| `creado_en` | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| `actualizado_en` | DATETIME | ON UPDATE CURRENT_TIMESTAMP |

---

### `descuentos`
Cupones de descuento aplicables a pedidos.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | INT UNSIGNED | PK, AUTO_INCREMENT |
| `codigo` | VARCHAR(50) | UNIQUE |
| `descripcion` | VARCHAR(255) | nullable |
| `tipo` | ENUM | `'porcentaje'`, `'monto_fijo'` |
| `valor` | DECIMAL(10,2) | > 0; si es porcentaje: entre 0 y 100 |
| `minimo_pedido` | DECIMAL(10,2) | nullable |
| `uso_maximo` | INT | nullable (NULL = ilimitado) |
| `usos_actuales` | INT | DEFAULT 0 |
| `valido_desde` | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| `valido_hasta` | DATETIME | nullable |
| `activo` | TINYINT(1) | DEFAULT 1 |
| `creado_en` | DATETIME | DEFAULT CURRENT_TIMESTAMP |

**Índice:** `idx_activo_valido (activo, valido_hasta)`  
**Checks:** `chk_descuento_pct`, `chk_descuento_valor`

---

### `historial_precios`
Historial de cambios de precio y costo por producto.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | INT UNSIGNED | PK, AUTO_INCREMENT |
| `producto_id` | INT UNSIGNED | FK → `productos.id` |
| `precio_anterior` | DECIMAL(10,2) | |
| `precio_nuevo` | DECIMAL(10,2) | |
| `costo_anterior` | DECIMAL(10,2) | |
| `costo_nuevo` | DECIMAL(10,2) | |
| `admin_id` | INT UNSIGNED | nullable |
| `cambiado_en` | DATETIME | DEFAULT CURRENT_TIMESTAMP |

**Índice:** `idx_cambiado_en`

---

### `pedido_items`
Líneas de detalle de cada pedido.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | INT UNSIGNED | PK, AUTO_INCREMENT |
| `pedido_id` | INT UNSIGNED | FK → `pedidos.id` |
| `producto_id` | INT UNSIGNED | FK → `productos.id` |
| `cantidad` | INT | CHECK > 0 |
| `precio_unit` | DECIMAL(10,2) | Precio al momento de la compra |
| `subtotal` | DECIMAL(10,2) | **GENERADO:** `cantidad * precio_unit` (STORED) |

---

### `pedidos`
Pedidos realizados por clientes.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | INT UNSIGNED | PK, AUTO_INCREMENT |
| `cliente_id` | INT UNSIGNED | FK → `clientes.id` |
| `estado` | ENUM | `'pendiente'`, `'confirmado'`, `'entregado'`, `'cancelado'` |
| `notas` | TEXT | nullable (ej: dirección de entrega) |
| `total` | DECIMAL(10,2) | DEFAULT 0.00 (actualizado por triggers) |
| `descuento_id` | INT UNSIGNED | FK → `descuentos.id`, nullable |
| `creado_en` | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| `actualizado_en` | DATETIME | ON UPDATE CURRENT_TIMESTAMP |

**Índices:** `idx_estado`, `idx_creado_en`, `idx_estado_creado_en`, `idx_cliente_estado`

---

### `productos`
Catálogo de productos de la golosinería.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | INT UNSIGNED | PK, AUTO_INCREMENT |
| `nombre` | VARCHAR(150) | |
| `descripcion` | TEXT | nullable |
| `precio` | DECIMAL(10,2) | CHECK > 0 |
| `precio_costo` | DECIMAL(10,2) | DEFAULT 0.00, CHECK >= 0 |
| `categoria_id` | INT UNSIGNED | FK → `categorias.id` |
| `stock` | INT | DEFAULT 0, CHECK >= 0 |
| `imagen_url` | VARCHAR(500) | URL de Cloudinary, nullable |
| `visible` | TINYINT(1) | DEFAULT 1 (visible en tienda) |
| `eliminado` | TINYINT(1) | DEFAULT 0 (soft delete) |
| `creado_en` | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| `actualizado_en` | DATETIME | ON UPDATE CURRENT_TIMESTAMP |

---

### `usuarios_admin`
Administradores del sistema.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | INT UNSIGNED | PK, AUTO_INCREMENT |
| `nombre` | VARCHAR(100) | |
| `email` | VARCHAR(150) | UNIQUE |
| `password_hash` | VARCHAR(255) | bcrypt |
| `rol` | ENUM | `'superadmin'`, `'admin'` |
| `activo` | TINYINT(1) | DEFAULT 1 |
| `creado_en` | DATETIME | DEFAULT CURRENT_TIMESTAMP |

---

## VISTAS

### `v_admin_clientes`
Clientes con resumen de actividad.

| Columna | Origen |
|---|---|
| `id`, `nombre`, `telefono`, `email`, `direccion`, `creado_en` | `clientes` |
| `total_pedidos` | COUNT de pedidos no cancelados |
| `total_gastado` | SUM de totales no cancelados |
| `ultimo_pedido` | MAX `creado_en` de pedidos |

---

### `v_admin_pedidos`
Pedidos con datos del cliente y código de descuento.

| Columna | Origen |
|---|---|
| `id`, `estado`, `total`, `notas`, `creado_en`, `actualizado_en` | `pedidos` |
| `cliente_id`, `cliente_nombre`, `cliente_telefono`, `cliente_email` | `clientes` |
| `descuento_codigo` | `descuentos` |

Ordenados por `creado_en DESC`.

---

### `v_admin_productos`
Productos con categoría y métricas de ganancia.

| Columna | Origen / Cálculo |
|---|---|
| `id`, `nombre`, `descripcion`, `precio`, `precio_costo`, `stock`, `imagen_url`, `visible`, `eliminado`, `creado_en`, `actualizado_en` | `productos` |
| `categoria_id`, `categoria` | `categorias` |
| `ganancia_unitaria` | `precio - precio_costo` |
| `margen_pct` | `((precio - precio_costo) / precio) * 100` |

Solo incluye productos con `eliminado = 0`. Ordenados por categoría y nombre.

---

### `v_tienda_productos_disponibles`
Productos visibles para el cliente final.

| Columna | Origen |
|---|---|
| `id`, `nombre`, `descripcion`, `precio`, `stock`, `imagen_url` | `productos` |
| `categoria` | `categorias` |

Filtro: `visible = 1 AND eliminado = 0 AND stock > 0`.

---

## STORED PROCEDURES

### `sp_admin_cambiar_estado_pedido(p_id, p_estado, p_admin_id)`
Cambia el estado de un pedido con validaciones de transición.
- No permite cambiar pedidos ya `cancelado` o `entregado`.
- Estados válidos: `pendiente`, `confirmado`, `entregado`, `cancelado`.
- El log de auditoría lo maneja el trigger `trg_pedidos_after_update`.

---

### `sp_admin_cancelar_pedido_con_stock(p_id)`
Cancela un pedido y **devuelve el stock** de cada producto al inventario.
- Usa transacción con `ROLLBACK` en error.

---

### `sp_admin_crear_cliente(p_nombre, p_telefono, p_direccion, p_email)`
Crea un nuevo cliente. Valida que teléfono y email no existan.
- Retorna: `id_generado`.

---

### `sp_admin_crear_producto(p_nombre, p_descripcion, p_precio, p_precio_costo, p_categoria, p_stock, p_imagen_url)`
Crea un producto buscando la categoría por nombre.

---

### `sp_admin_detalle_pedido(p_id)`
Retorna las líneas de un pedido con nombre de producto, cantidad, precio unitario y subtotal.

---

### `sp_admin_editar_cliente(p_id, p_nombre, p_telefono, p_direccion, p_email)`
Actualiza datos de un cliente. Valida unicidad de teléfono y email.

---

### `sp_admin_editar_pedido(p_id, p_notas)`
Actualiza solo las notas de un pedido.

---

### `sp_admin_editar_producto(p_id, p_nombre, p_precio, p_precio_costo, p_categoria, p_stock, p_imagen_url)`
Actualiza un producto. Busca la categoría por nombre.

---

### `sp_tienda_registrar_pedido(p_nombre, p_telefono, p_notas, p_items_json, p_codigo_desc)`
Registra un pedido completo desde la tienda. Proceso:
1. Obtiene o crea el cliente por teléfono.
2. Crea el pedido vacío.
3. Procesa cada item del JSON `[{id, cant}]`, descuenta stock.
4. Aplica descuento si se pasa `p_codigo_desc`.
5. Retorna: `pedido_generado`, `total_final`.
- Usa transacción completa con `ROLLBACK`.

---

### `sp_tienda_validar_descuento(p_codigo, p_total)`
Valida un cupón de descuento para un total dado.
- Retorna: `id`, `codigo`, `descripcion`, `tipo`, `valor`, `estado` (`valido`/`inactivo`/`vencido`/`agotado`/`minimo_no_alcanzado`), `ahorro_estimado`.

---

## TRIGGERS (resumen)

| Trigger | Tabla | Evento | Acción |
|---|---|---|---|
| `trg_pedido_items_after_insert` | `pedido_items` | AFTER INSERT | Actualiza `pedidos.total` sumando el subtotal del item |
| `trg_pedidos_after_update` | `pedidos` | AFTER UPDATE | Inserta fila en `auditoria` con estado/total/notas anterior y nuevo |
| `trg_productos_after_update` | `productos` | AFTER UPDATE | Inserta fila en `auditoria` con stock/nombre/visible/eliminado anterior y nuevo; si cambió el precio, inserta en `historial_precios` |

---

## RELACIONES (FK)

```
categorias
  └── productos.categoria_id

clientes
  └── pedidos.cliente_id

descuentos
  └── pedidos.descuento_id

pedidos
  └── pedido_items.pedido_id

productos
  └── pedido_items.producto_id
  └── historial_precios.producto_id
```

---

## NOTAS GENERALES

- **Soft delete en productos:** usar `eliminado = 0` en todas las consultas de productos activos.
- **Visibilidad tienda:** `visible = 1 AND eliminado = 0 AND stock > 0`.
- **Imágenes:** almacenadas en Cloudinary, la columna guarda la URL completa.
- **Totales de pedido:** calculados automáticamente por triggers, no hardcodear.
- **Auditoría:** automática vía triggers; no requiere lógica en la app.
- **Descuentos:** pueden ser `porcentaje` o `monto_fijo`; validar siempre con `sp_tienda_validar_descuento` antes de aplicar.
