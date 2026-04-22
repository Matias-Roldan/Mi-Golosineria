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
Service → catch → throw new AppError(err.sqlMessage, 400)
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

**Beneficio:** el cliente recibe un mensaje claro. Los detalles del stack trace solo quedan en los logs del servidor.

---

## 7. Middleware como Pipeline

**Principio:** el procesamiento de una request es una cadena de funciones. Cada middleware tiene una única responsabilidad y decide si pasa la request a la siguiente etapa.

### Stack de middlewares en `app.js`

```
Incoming HTTP Request
        ↓
   helmet()          → Agrega headers de seguridad (X-Frame-Options, CSP, etc.)
        ↓
   cors()            → Valida que el origen sea permitido (localhost:5173)
        ↓
   express.json()    → Parsea el body JSON (límite 2MB)
        ↓
   rateLimit()       → Bloquea si supera 1000 req/15min
        ↓
   Routes            → Lógica de negocio
        ↓
   Error Handler     → Captura cualquier error, devuelve JSON
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
Multer (backend)  → buffer en memoria
        ↓
Cloudinary SDK    → sube, transforma (800x800, compresión auto)
        ↓
Returns secure_url (CDN HTTPS)
        ↓
Frontend guarda URL en el formulario del producto
        ↓
POST /api/admin/productos → imagen_url en MySQL
```

**Beneficio arquitectónico:** el servidor no almacena archivos en disco. Cloudinary es el servicio especializado en imágenes (CDN, optimización, backups). MySQL solo guarda la URL.

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
