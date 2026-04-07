require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/productos', require('./routes/productRoutes'));
app.use('/api/pedidos',  require('./routes/orderRoutes'));
app.use('/api/clientes', require('./routes/userRoutes'));
app.use('/api/admin',    require('./routes/adminRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Health check
app.get('/', (req, res) => res.json({ status: 'OK', mensaje: 'Mondelez Store API' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));