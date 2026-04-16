require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// ── Seguridad: headers HTTP ───────────────────────────────────────────
app.use(helmet());

// ── CORS: solo el origen configurado en .env ─────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (ej: curl, Postman en dev)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Origen no permitido por CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body parsing con límite de tamaño ────────────────────────────────
app.use(express.json({ limit: '2mb' }));

// ── Rate limiting global ──────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes, intentá más tarde.' },
});
app.use('/api/', globalLimiter);

// ── Rutas ─────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/productos', require('./routes/productRoutes'));
app.use('/api/pedidos',   require('./routes/orderRoutes'));
app.use('/api/clientes',  require('./routes/userRoutes'));
app.use('/api/admin',     require('./routes/adminRoutes'));
app.use('/api/upload',    require('./routes/uploadRoutes'));

// ── Health check ──────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: 'OK' }));

// ── Manejo global de errores (no expone stack traces) ─────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));