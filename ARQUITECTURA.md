# Fundamentos de Arquitectura de Software — Mi Golosinería

> Documento de estudio basado en el proyecto real. Cada concepto teórico tiene su ejemplo concreto en el código.

---

## 1. ¿Qué es la Arquitectura de Software?

La arquitectura de software define **cómo se organizan los componentes de un sistema**, cómo se comunican entre sí y qué decisiones estructurales guían su crecimiento. No es el código en sí, sino el _esqueleto_ que lo sostiene.

**En este proyecto:** la arquitectura separa el sistema en dos grandes partes (frontend y backend), cada una con capas internas bien definidas.

---

## 2. Separación de Responsabilidades (SoC)

**Principio:** cada módulo debe tener una única razón para cambiar.

### En el Backend — Arquitectura en Capas

```
HTTP Request
     ↓
 Route          → Solo define el path y aplica middlewares
     ↓
 Controller     → Traduce HTTP a datos (req/res)
     ↓
 Service        → Lógica de negocio y validaciones
     ↓
 Repository     → Acceso a datos (SQL, SPs, vistas)
     ↓
 Database (MySQL)
```

**Ejemplo concreto — registrar un pedido:**

| Capa | Archivo | Responsabilidad |
|------|---------|-----------------|
| Route | `routes/orderRoutes.js` | `POST /api/pedidos` → llama al controller |
| Controller | `controllers/orderController.js` | Lee `req.body`, llama al service, devuelve 201 |
| Service | `services/pedidoService.js` | Valida nombre, teléfono, items (longitud, stock) |
| Repository | `repositories/pedidoRepository.js` | Ejecuta `CALL sp_tienda_registrar_pedido(...)` |
| DB | MySQL SP | Transacción atómica: crea cliente, descuenta stock, crea pedido |

> Si mañana cambia la validación del teléfono, solo se toca el **service**.  
> Si cambia la base de datos, solo se toca el **repository**.

---

## 3. Patrón MVC (Model-View-Controller)

**Teoría:** separa datos (Model), presentación (View) y lógica de control (Controller).

### En el Frontend — Variante React

| Rol MVC | Elemento en el proyecto | Ejemplo |
|---------|------------------------|---------|
| **Model** | Zustand stores + TanStack Query | `useCartStore`, `useAuthStore` |
| **View** | Componentes JSX | `Tienda.jsx`, `ProductoCard.jsx` |
| **Controller** | Event handlers + API calls | `handleConfirmar()` en `Tienda.jsx` |

### En el Backend — MVC Clásico

| Rol MVC | Elemento | Ejemplo |
|---------|----------|---------|
| **Model** | Repository + DB | `pedidoRepository.js` → MySQL |
| **View** | JSON response | `{ mensaje: "...", pedido_id: 123 }` |
| **Controller** | Controller functions | `orderController.registrarPedido()` |

---

## 4. Patrón Repository

**Problema que resuelve:** el resto del sistema no debe saber si los datos vienen de MySQL, una API externa o un archivo. El repository es la única capa que habla con la base de datos.

```js
// repositories/pedidoRepository.js
const registrar = async ({ nombre_cliente, telefono, notas, itemsJson, cupon }) => {
  const [rows] = await pool.query(
    'CALL sp_tienda_registrar_pedido(?,?,?,?,?)',
    [nombre_cliente, telefono, notas, itemsJson, cupon]
  );
  return rows[0][0].pedido_generado;
};
```

**Beneficio:** si en el futuro se migra a PostgreSQL o a un ORM, solo cambia el repository — el service no se entera.

---

## 5. Principio de Inversión de Dependencias (DIP)

**Teoría:** los módulos de alto nivel no deben depender de los de bajo nivel. Ambos deben depender de abstracciones.

**En este proyecto:** el `pedidoService` llama a funciones del `pedidoRepository` a través de su interfaz pública (exportaciones), no accede directamente al pool de MySQL. La capa de negocio no sabe qué motor de base de datos existe.

```
pedidoService.js   →  llama a →  pedidoRepository.js (abstracción)
                                          ↓
                                    pool.query() (detalle)
```

---

## 6. Manejo de Errores — Error Boundary

**Problema:** si un stored procedure falla con un error de negocio (ej: stock insuficiente), ese error debe llegar al usuario de forma limpia, sin exponer detalles internos del servidor.

### Flujo de errores en este proyecto

```
MySQL SP → SIGNAL SQLSTATE '45000' (error de negocio)
     ↓
Repository → lanza err.sqlState === '45000'
     ↓
sanitizeDbError() → throw new AppError(err.message, 400)
     ↓
Service → propagate / catch errores desconocidos
     ↓
Controller → next(err)
     ↓
Global Error Handler (app.js) → { error: "mensaje en español" } (HTTP 400)
```

**Clase base:**
```js
// errors/AppError.js
class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}
```

**Utilitario `sanitizeDbError`** — centraliza el mapeo de errores MySQL a mensajes de usuario:
```js
// utils/sanitizeDbError.js
const MYSQL_ERROR_MESSAGES = {
  1062: 'Ya existe un registro con esos datos.',
  1452: 'El registro referenciado no existe.',
  1451: 'No se puede eliminar porque tiene registros asociados.',
  1406: 'El valor ingresado supera el límite permitido.',
  1048: 'Falta un campo requerido.',
};

const sanitizeDbError = (err) => {
  if (err.sqlState === '45000') throw new AppError(err.message, 400);
  const mensaje = MYSQL_ERROR_MESSAGES[err.errno] ?? 'Error en la base de datos';
  throw new AppError(mensaje, 500);
};
```

**Beneficio:** el cliente recibe un mensaje claro. Los errores internos de MySQL nunca llegan al frontend.

---

## 7. Middleware como Pipeline

**Principio:** el procesamiento de una request es una cadena de funciones. Cada middleware tiene una única responsabilidad y decide si pasa la request a la siguiente etapa.

### Stack de middlewares en `app.js`

```
Incoming HTTP Request
        ↓
   helmet()          → Agrega headers de seguridad (X-Frame-Options, CSP, etc.)
        ↓
   requestLogger     → Loguea método, URL, statusCode y tiempo de respuesta (Winston)
        ↓
   cors()            → Valida que el origen sea permitido (ALLOWED_ORIGINS)
        ↓
   express.json()    → Parsea el body JSON (límite 2MB)
        ↓
   rateLimit()       → Bloquea si supera 1000 req/15min
        ↓
   Routes            → Lógica de negocio
        ↓
   Error Handler     → Captura cualquier error, devuelve JSON sin exponer stack
```

**Middlewares de autenticación (por ruta):**

```
POST /api/admin/productos
        ↓
   auth.js           → Verifica JWT Bearer token → req.admin = { id, email, rol }
        ↓
   isAdmin.js        → Verifica que req.admin.rol sea 'admin' o 'superadmin'
        ↓
   productController.crearProducto()
```

**Middleware `requestLogger`** — registra cada request HTTP con su tiempo de respuesta:
```js
// middleware/requestLogger.js
res.on('finish', () => {
  logger.info('request', {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    responseTime: `${Date.now() - start}ms`,
  });
});
```

---

## 8. Gestión de Estado — State Management

**Problema:** en una SPA (Single Page Application), el estado puede vivir en muchos lugares. Elegir mal dónde ponerlo genera bugs y código difícil de mantener.

### Decisión de arquitectura: Estado por Responsabilidad

| Tipo de Estado | Herramienta | Motivo |
|----------------|-------------|--------|
| Auth (sesión admin) | Zustand | Simple, accesible desde cualquier componente |
| Carrito de compras | Zustand + `persist` | Debe sobrevivir al refresco (localStorage) |
| UI efímero (sidebar) | Zustand | Estado local de interfaz, no persiste |
| Datos del servidor | TanStack Query | Maneja caché, revalidación, loading/error automático |
| Peticiones simples | Axios directo | Cuando no se necesita caché (tienda pública) |

**Ejemplo — Carrito:**
```js
// stores/useCartStore.js
const useCartStore = create(
  persist(
    (set, get) => ({
      carrito: [],
      agregar: (producto) => { /* lógica inmutable: spread + upsert */ },
      vaciar: () => set({ carrito: [] }),
    }),
    { name: 'carrito' } // clave en localStorage
  )
);
```

**Ejemplo — Dashboard con TanStack Query:**
```js
const { data } = useQuery({
  queryKey: ['dashboard'],
  queryFn: () => Promise.all([getKpis(), getVentasDiarias(), getTopProductos(), ...]),
  staleTime: 5 * 60 * 1000, // cache válido 5 minutos
});
```

---

## 9. API Layer — Abstracción del Cliente HTTP

**Principio:** los componentes no deben hacer fetch directamente. Toda comunicación HTTP pasa por un módulo de API dedicado.

### Instancia compartida de Axios

```js
// api/axios.js
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

**Beneficio:** el JWT se inyecta automáticamente en cada request. Los módulos de API nunca lo manejan manualmente.

### API por dominio

```
src/api/
├── axios.js          → instancia base (interceptor JWT)
├── authApi.js        → login(), getMe()
├── productosApi.js   → getDisponibles(), crear(), editar(), eliminar()
├── pedidosApi.js     → registrar(), validarCupon(), cambiarEstado()
├── adminApi.js       → getKpis(), getPareto(), getRFM(), getSaludStock()
└── clientesApi.js    → listar(), editar(), eliminar()
```

---

## 10. Seguridad como Arquitectura (Security by Design)

La seguridad no es un feature, es parte del diseño desde el principio.

### Capas de defensa en este proyecto

| Capa | Mecanismo | Dónde |
|------|-----------|-------|
| Red | CORS restrictivo | `app.js` → `cors({ origin: ALLOWED_ORIGINS })` |
| Headers HTTP | Helmet | `app.js` → `helmet()` |
| Autenticación | JWT firmado con `JWT_SECRET` | `middleware/auth.js` |
| Autorización | Verificación de rol | `middleware/isAdmin.js` |
| Fuerza bruta | Rate limiting | 5 intentos/min en login |
| Contraseñas | Bcrypt hash | `authService.js` |
| SQL Injection | Prepared statements + SPs | Todos los repositories |
| Exposición de datos | Mensajes de error controlados | `AppError` + global handler |

---

## 11. Base de Datos — Lógica de Negocio en el Servidor Correcto

**Debate clásico:** ¿dónde va la lógica de negocio? ¿En la app o en la base de datos?

### Decisión arquitectónica de este proyecto

**Operaciones atómicas complejas → Stored Procedures (SP):**

El SP `sp_tienda_registrar_pedido` hace en una sola transacción:
1. Busca o crea el cliente por teléfono
2. Crea el pedido
3. Por cada ítem: verifica stock disponible, descuenta stock, inserta `pedido_item`
4. Aplica descuento si hay cupón
5. El total se recalcula automáticamente vía trigger
6. Si cualquier paso falla → `ROLLBACK` completo

**Motivo:** si esto se hiciera en múltiples requests HTTP, un fallo a mitad del proceso dejaría datos inconsistentes (pedido creado pero stock no descontado).

**Lecturas optimizadas → Vistas (Views):**

```sql
-- v_tienda_productos_disponibles
-- Encapsula el filtro: visible=1 AND eliminado=0 AND stock>0
SELECT * FROM v_tienda_productos_disponibles;
```

**Beneficio:** el repository no repite la lógica de filtrado en cada consulta.

### Triggers — Consistencia Automática

| Trigger | Evento | Efecto |
|---------|--------|--------|
| `trg_pedido_items_after_insert` | Inserción de ítem | Actualiza total del pedido |
| `trg_pedidos_after_update` | Cambio de estado | Registra en `auditoria` |
| `trg_productos_after_update` | Cambio de precio | Registra en `historial_precios` |

---

## 12. Flujo de Carga de Imágenes — Arquitectura Multi-Servicio

```
Usuario selecciona imagen (frontend)
        ↓
POST /api/upload (multipart/form-data)
        ↓
Multer (backend)  → buffer en memoria (5MB máx, solo JPEG/PNG/WebP)
        ↓
imageService.upload()  → Stream → Cloudinary SDK
        ↓
Cloudinary      → transforma (800x800, compresión auto) → CDN HTTPS
        ↓
Returns { url, publicId }
        ↓
Frontend guarda URL en el formulario del producto
        ↓
POST /api/admin/productos → imagen_url en MySQL
```

**`imageService`** — desacopla la lógica de Cloudinary del route handler:
```js
// services/imageService.js
async function upload(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'mi-golosineria/productos', transformation: [...], ...options },
      (err, result) => err ? reject(err) : resolve({ url: result.secure_url, publicId: result.public_id })
    );
    Readable.from(buffer).pipe(stream);
  });
}
```

**Beneficio arquitectónico:** el route de upload se limita a validar el archivo y delegar. Si se cambia de Cloudinary a S3, solo cambia `imageService.js`.

---

## 13. Rutas Protegidas — Authorization Guard

**Patrón:** el componente `PrivateRoute` actúa como guardia en el frontend.

```jsx
// components/ui/PrivateRoute.jsx
const PrivateRoute = ({ children }) => {
  const { admin } = useAuth();
  return admin ? children : <Navigate to="/admin/login" replace />;
};

// App.jsx — uso
<Route path="/admin/productos" element={
  <PrivateRoute>
    <Productos />
  </PrivateRoute>
} />
```

**Doble verificación:** el frontend bloquea la navegación, pero el backend verifica el JWT en cada request. La seguridad real está en el servidor.

---

## 14. Convenciones de API — Contrato entre Frontend y Backend

Un contrato consistente reduce errores y facilita el trabajo en equipo.

**Respuestas de éxito:**
```json
{ "mensaje": "Pedido registrado", "pedido_id": 123 }
```
o datos directos:
```json
[{ "id": 1, "nombre": "Gomitas", "precio": 500 }]
```

**Respuestas de error:**
```json
{ "error": "Stock insuficiente para el producto solicitado" }
```

**Códigos HTTP usados:**
| Código | Significado | Cuándo |
|--------|-------------|--------|
| 200 | OK | GET exitoso |
| 201 | Created | POST que crea un recurso |
| 400 | Bad Request | Validación o error de negocio (SP SIGNAL) |
| 401 | Unauthorized | Token ausente o inválido |
| 403 | Forbidden | Token válido pero sin permisos |
| 404 | Not Found | Recurso inexistente |
| 500 | Server Error | Error inesperado (nunca expone stack trace) |

---

## 15. Inmutabilidad — Principio de Datos

**Regla:** nunca mutar el estado existente. Siempre crear copias con los cambios.

**Ejemplo en el carrito:**
```js
// MAL: muta el estado directamente
carrito.push(producto);

// BIEN: crea nuevo array con el cambio
set({ carrito: [...get().carrito, { ...producto, cantidad: 1 }] });
```

**Motivo:** React y Zustand detectan cambios por referencia. Si se muta el objeto original, la UI no se re-renderiza correctamente.

---

## 16. Resumen Visual — Arquitectura Completa

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React 19)                      │
│                                                                   │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Pages   │  │  Components  │  │  Stores  │  │  API Layer │  │
│  │ Tienda   │  │ ProductoCard │  │ Zustand  │  │ axios.js   │  │
│  │ Admin    │  │ Carrito      │  │ TanStack │  │ *Api.js    │  │
│  └────┬─────┘  └──────┬───────┘  └────┬─────┘  └─────┬──────┘  │
│       └───────────────┴──────────────┴──────────────┘          │
│                              ↕ HTTP/JSON                         │
└──────────────────────────────────────────────────────────────────┘
                              ↕ REST API
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND (Express 4)                      │
│                                                                   │
│  Middleware: helmet → cors → express.json → rateLimit            │
│                                                                   │
│  ┌──────────┐  ┌────────────┐  ┌─────────┐  ┌──────────────┐  │
│  │  Routes  │→ │Controllers │→ │Services │→ │ Repositories │  │
│  │ auth     │  │ req/res    │  │ negocio │  │ SQL/SPs      │  │
│  │ pedidos  │  │ traducción │  │ validac │  │ abstracción  │  │
│  │ admin    │  │ HTTP→datos │  │ errores │  │ pool MySQL   │  │
│  └──────────┘  └────────────┘  └─────────┘  └──────┬───────┘  │
│                                                       ↓          │
└───────────────────────────────────────────────────────────────── ┘
                              ↕ mysql2 pool
┌─────────────────────────────────────────────────────────────────┐
│                         MySQL 8                                   │
│                                                                   │
│  Views (lectura)      Stored Procedures (escritura)   Triggers   │
│  v_tienda_productos   sp_tienda_registrar_pedido      auditoria  │
│  v_admin_pedidos      sp_admin_cambiar_estado         historial  │
│  v_admin_clientes     sp_analisis_rfm_clientes        totales    │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                  Servicios Externos                               │
│                                                                   │
│  Cloudinary (imágenes CDN)    JWT (autenticación stateless)      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 17. Observabilidad — Logging Estructurado

**Problema:** en producción no hay terminal interactiva. Si ocurre un error, necesitás saber qué pasó, cuándo y con qué datos, sin reiniciar el servidor.

### Logger Winston

```js
// config/logger.js
const logger = createLogger({
  level: isProduction ? 'info' : 'debug',
  format: isProduction ? productionFormat : developmentFormat,
  transports: [
    new transports.Console(),
    new transports.DailyRotateFile({ filename: 'logs/error-%DATE%.log', level: 'error', maxFiles: '14d' }),
    new transports.DailyRotateFile({ filename: 'logs/combined-%DATE%.log', maxFiles: '14d' }),
  ],
});
```

| Entorno | Formato | Destino |
|---------|---------|---------|
| Desarrollo | `HH:mm:ss [level]: mensaje` con colores | Consola |
| Producción | JSON estructurado | Consola + archivos rotativos |

**Archivos rotativos:** se generan diariamente, se comprimen y se eliminan solos a los 14 días. El disco no se llena.

**Uso en el código:**
```js
logger.info('Servidor en http://localhost:3001');
logger.warn('MySQL reconectando...', { attempt: 1, maxRetries: 3 });
logger.error('Error inesperado', { message: err.message, stack: err.stack });
```

---

## 18. Resiliencia — Reconexión Automática del Pool MySQL

**Problema:** si la base de datos se reinicia o pierde la conexión, el pool de MySQL falla y el servidor deja de funcionar.

### Solución: reconexión con backoff exponencial

```js
// config/db.js
const attachErrorHandler = (targetPool, attempt = 0) => {
  targetPool.pool.on('error', async (err) => {
    if (!RECONNECTABLE_CODES.has(err.code)) return;
    if (attempt >= MAX_RETRIES) { process.exit(1); }

    const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
    await sleep(delay);
    pool = createPool();
    attachErrorHandler(pool, attempt + 1);
  });
};
```

**Flujo:** error → espera 1s → reintento 1 → espera 2s → reintento 2 → espera 4s → reintento 3 → si falla, proceso termina (para que el orquestador lo reinicie).

**Por qué backoff exponencial:** evita saturar el servidor de base de datos con reconexiones simultáneas.

---

## 19. Validación de Entorno al Arranque — Fail Fast

**Principio:** es mejor fallar al iniciar que fallar en el momento de atender una request real.

```js
// config/validateEnv.js
const VARIABLES_REQUERIDAS = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME',
                               'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];

function validateEnv() {
  const faltantes = VARIABLES_REQUERIDAS.filter((v) => process.env[v] === undefined);
  if (faltantes.length > 0) {
    console.error('ERROR: Faltan variables de entorno requeridas:');
    faltantes.forEach((v) => console.error(`  - ${v}`));
    process.exit(1);
  }
}
```

Se llama en la primera línea de `app.js`, antes de inicializar Express. Si falta una variable, el servidor no arranca y el error es claro.

---

## 20. Utilitarios de Respuesta HTTP — Consistencia

**Problema:** sin un helper, cada controller tiene su propia forma de construir respuestas, lo que genera inconsistencia y código repetido.

```js
// utils/response.js
const success = (res, data, status = 200) => res.status(status).json(data);
const created = (res, data) => res.status(201).json(data);
const error = (res, message, status = 400) => res.status(status).json({ error: message });
```

**Uso en controllers y routes:**
```js
// En vez de: res.status(200).json(data)
success(res, data);

// En vez de: res.status(201).json(data)
created(res, data);

// En vez de: res.status(400).json({ error: 'mensaje' })
error(res, 'mensaje', 400);
```

**Beneficio:** si se quiere cambiar el formato de respuesta (ej: agregar `{ success: true, data: ... }`), se cambia en un solo lugar.

---

## 21. Testing — Pruebas Unitarias del Service Layer

**Principio:** los services son el corazón de la lógica de negocio. Son la capa más crítica para testear porque no dependen de HTTP ni de la base de datos real.

### Estructura de test con Jest

```js
// __tests__/pedidoService.test.js
jest.mock('../repositories/pedidoRepository');

describe('pedidoService.registrar', () => {
  it('llama al repositorio y devuelve el id cuando los datos son válidos', async () => {
    // Arrange
    pedidoRepo.registrar.mockResolvedValue(42);
    // Act
    const resultado = await pedidoService.registrar(DATOS_VALIDOS);
    // Assert
    expect(resultado).toBe(42);
  });

  it('lanza AppError 400 cuando items está vacío', async () => {
    await expect(pedidoService.registrar({ ...DATOS_VALIDOS, items: [] }))
      .rejects.toMatchObject({ status: 400 });
  });
});
```

**Casos testeados:**
- Caso feliz: datos válidos → llama repository → devuelve id
- Items vacíos o nulos → AppError 400
- Cantidad de item ≤ 0 → AppError 400
- Teléfono con letras o muy corto → AppError 400
- Error MySQL SQLSTATE 45000 → AppError 400 con mensaje del SP
- Error desconocido → se propaga sin modificar

**Mock del repository:** `jest.mock(...)` reemplaza el módulo real por un mock. El service se testea en aislamiento total — sin base de datos, sin red.

---

## 22. Componentización del Frontend — Carrito Refactorizado

**Principio:** un componente con más de ~150 líneas suele mezclar responsabilidades. Dividirlo mejora la legibilidad y la reutilización.

### Antes vs Después

| Antes | Después |
|-------|---------|
| `Carrito.jsx` — un solo archivo con toda la UI y lógica | `carrito/` — carpeta con 5 componentes + estilos |

### Estructura del módulo `carrito/`

```
frontend/src/components/tienda/carrito/
├── CartHeader.jsx      → Encabezado con título y botón de cerrar
├── CartItems.jsx       → Lista de ítems del carrito
├── CartItem.jsx        → Un ítem individual (nombre, precio, controles de cantidad)
├── CartCheckout.jsx    → Formulario y botón de confirmar pedido
├── CartTotal.jsx       → Resumen del total a pagar
└── carritoStyles.js    → Objeto de estilos compartidos entre los componentes
```

**Beneficio:** cada componente puede leerse y modificarse independientemente. Si cambia la lógica de checkout, no hay que tocar los ítems ni el header.

---

## Glosario Rápido

| Término | Definición | Ejemplo en el proyecto |
|---------|------------|----------------------|
| **SoC** | Separation of Concerns — cada módulo hace una cosa | Controller ≠ Service ≠ Repository |
| **MVC** | Model-View-Controller | Stores / JSX / Handlers |
| **Repository Pattern** | Abstrae el acceso a datos | `pedidoRepository.js` |
| **Middleware** | Función que procesa requests en cadena | `auth.js`, `helmet`, `rateLimit` |
| **Stored Procedure** | Lógica de DB ejecutada en el servidor de BD | `sp_tienda_registrar_pedido` |
| **JWT** | JSON Web Token — autenticación stateless | Bearer token en Authorization header |
| **Rate Limiting** | Limita requests por IP/tiempo | 5 intentos de login por minuto |
| **Inmutabilidad** | No mutar estado, crear copias | `set({ carrito: [...carrito, item] })` |
| **Error Boundary** | Captura y controla la propagación de errores | `AppError` + global handler |
| **CDN** | Content Delivery Network | Cloudinary para imágenes |
| **Logging estructurado** | Logs en formato JSON con metadatos | Winston + `DailyRotateFile` |
| **Backoff exponencial** | Espera que crece en cada reintento (1s, 2s, 4s...) | Reconexión MySQL pool |
| **Fail Fast** | Fallar al arrancar, no en producción | `validateEnv()` en `app.js` |
| **Mock** | Reemplazo de dependencia real en tests | `jest.mock('../repositories/pedidoRepository')` |
| **Componentización** | Dividir UI compleja en piezas pequeñas | Carrito → 5 componentes |
