import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../../hooks/useCart';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// ─── Stock helpers ────────────────────────────────────────────────────
const stockConfig = (n) => {
  if (n === 0) return { label: 'Sin stock',        color: '#ef4444', bg: '#fef2f2', border: '#fecaca', dot: '#ef4444' };
  if (n <= 3)  return { label: `Últimas ${n}`,     color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', dot: '#f59e0b' };
  if (n <= 8)  return { label: `${n} disponibles`, color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0', dot: '#10b981' };
  return             { label: 'En stock',           color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0', dot: '#10b981' };
};

const catStyle = (cat) => {
  const map = {
    Chocolates: { bg: '#fef3c7', color: '#92400e' },
    Caramelos:  { bg: '#fce7f3', color: '#9d174d' },
    Chicles:    { bg: '#e0f2fe', color: '#0c4a6e' },
    Galletas:   { bg: '#fef9c3', color: '#713f12' },
    Snacks:     { bg: '#f0fdf4', color: '#14532d' },
    Bebidas:    { bg: '#ede9fe', color: '#4c1d95' },
  };
  return map[cat] ?? { bg: '#f3e8ff', color: '#6d28d9' };
};

// ════════════════════════════════════════════════════════════════════
export default function ProductoCard({ producto }) {
  const { agregar, carrito } = useCart();
  const [adding,   setAdding]   = useState(false);
  const [imgError, setImgError] = useState(false);

  const itemEnCarrito   = carrito.find((p) => p.id === producto.id);
  const cantCarrito     = itemEnCarrito?.cantidad ?? 0;
  const stockDisponible = producto.stock - cantCarrito;
  const stock           = stockConfig(stockDisponible);
  const badge           = catStyle(producto.categoria);
  const sinStock        = stockDisponible === 0;

  const handleAgregar = () => {
    if (sinStock || adding) return;
    setAdding(true);
    agregar(producto);
    setTimeout(() => setAdding(false), 650);
  };

  return (
    <motion.div
      whileHover={sinStock ? {} : { y: -10, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      style={{ opacity: sinStock ? 0.62 : 1 }}
    >
      <Card style={C.card}>
        {/* ── Imagen ── */}
        <div style={C.imgWrap}>
          {producto.imagen_url && !imgError ? (
            <motion.img
              src={producto.imagen_url}
              alt={producto.nombre}
              style={C.img}
              whileHover={sinStock ? {} : { scale: 1.08 }}
              transition={{ duration: 0.45, ease: [0.33, 1, 0.68, 1] }}
              onError={() => setImgError(true)}
            />
          ) : (
            <div style={C.imgPlaceholder}>
              <span style={{ fontSize: '3.8rem', filter: 'drop-shadow(0 6px 12px rgba(168,85,247,0.25))' }}>🍬</span>
            </div>
          )}

          {/* Badge categoría */}
          <Badge
            style={{ ...C.catBadge, background: badge.bg, color: badge.color }}
          >
            {producto.categoria}
          </Badge>

          {/* Overlay sin stock */}
          {sinStock && (
            <div style={C.outOfStockOverlay}>
              <span style={C.outOfStockLabel}>Agotado</span>
            </div>
          )}
        </div>

        {/* ── Cuerpo ── */}
        <CardContent style={C.body}>

          {/* Nombre */}
          <h3 style={C.nombre}>{producto.nombre}</h3>

          {/* Descripción */}
          {producto.descripcion && (
            <p style={C.descripcion}>{producto.descripcion}</p>
          )}

          {/* Stock */}
          <div style={{ ...C.stockPill, background: stock.bg, border: `1px solid ${stock.border}` }}>
            <span style={{ ...C.stockDot, background: stock.dot, boxShadow: `0 0 6px ${stock.dot}55` }} />
            <span style={{ ...C.stockLabel, color: stock.color }}>{stock.label}</span>
          </div>

          {/* Footer precio + botón */}
          <div style={C.footer}>
            <div style={C.precioWrap}>
              <span style={C.precioLabel}>precio</span>
              <span style={C.precio}>${Number(producto.precio).toLocaleString('es-AR')}</span>
            </div>

            <motion.button
              style={{
                ...C.btn,
                ...(sinStock ? C.btnDisabled : adding ? C.btnAdding : {}),
              }}
              onClick={handleAgregar}
              disabled={sinStock}
              animate={adding ? { scale: [1, 1.14, 0.95, 1.05, 1] } : { scale: 1 }}
              whileHover={sinStock ? {} : { scale: 1.03, y: -2 }}
              whileTap={sinStock ? {} : { scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              {adding ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ fontWeight: 900 }}>✓</span> ¡Listo!
                </span>
              ) : sinStock ? (
                'Agotado'
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>＋</span> Agregar
                </span>
              )}
            </motion.button>
          </div>

          {/* In-cart badge */}
          {cantCarrito > 0 && (
            <motion.div
              style={C.inCartBadge}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            >
              🛒 {cantCarrito} en tu carrito
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────
const C = {
  card: {
    background: 'white',
    borderRadius: '24px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'default',
    fontFamily: "'Nunito', system-ui, sans-serif",
    boxShadow: '0 2px 16px rgba(168,85,247,0.08), 0 0 0 1px #f3e8ff',
    border: 'none',
  },

  // Imagen
  imgWrap: {
    height: '250px',
    background: 'linear-gradient(145deg, #fef9f0 0%, #f3e8ff 50%, #fce7f3 100%)',
    position: 'relative',
    overflow: 'hidden',
    flexShrink: 0,
  },
  img: {
    width: '100%', height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  imgPlaceholder: {
    width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  catBadge: {
    position: 'absolute',
    top: '12px', left: '12px',
    fontSize: '0.65rem',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    padding: '0.22rem 0.7rem',
    borderRadius: '50px',
    border: 'none',
  },
  outOfStockOverlay: {
    position: 'absolute', inset: 0,
    background: 'rgba(254,249,240,0.8)',
    backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  outOfStockLabel: {
    background: '#ef4444',
    color: 'white',
    fontSize: '0.72rem',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    padding: '0.32rem 0.9rem',
    borderRadius: '50px',
    boxShadow: '0 4px 12px rgba(239,68,68,0.35)',
  },

  // Cuerpo
  body: {
    padding: '1.2rem 1.25rem 1.3rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: '0.55rem',
  },
  nombre: {
    fontSize: '1.05rem',
    fontWeight: '900',
    color: '#1e1333',
    margin: 0,
    lineHeight: 1.25,
    letterSpacing: '-0.02em',
  },
  descripcion: {
    fontSize: '0.8rem',
    color: '#7c6a9e',
    margin: 0,
    lineHeight: 1.55,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },

  // Stock
  stockPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.38rem',
    padding: '0.26rem 0.7rem',
    borderRadius: '50px',
    alignSelf: 'flex-start',
  },
  stockDot: {
    width: '7px', height: '7px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  stockLabel: {
    fontSize: '0.7rem',
    fontWeight: '800',
    letterSpacing: '0.02em',
  },

  // Footer
  footer: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 'auto',
    paddingTop: '0.3rem',
    gap: '0.65rem',
  },
  precioWrap: { display: 'flex', flexDirection: 'column', lineHeight: 1.1 },
  precioLabel: {
    fontSize: '0.58rem',
    fontWeight: '800',
    color: '#a78bfa',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
  },
  precio: {
    fontSize: '1.85rem',
    fontWeight: '900',
    color: '#1e1333',
    letterSpacing: '-0.04em',
    fontFamily: 'Georgia, serif',
  },

  // Botón
  btn: {
    padding: '0.72rem 1.15rem',
    borderRadius: '14px',
    border: 'none',
    background: 'linear-gradient(135deg, #a855f7, #e879f9)',
    color: 'white',
    fontWeight: '900',
    fontSize: '0.9rem',
    cursor: 'pointer',
    minHeight: '46px',
    width: '100%',
    fontFamily: "'Nunito', inherit",
    letterSpacing: '0.01em',
    boxShadow: '0 4px 18px rgba(168,85,247,0.38)',
    whiteSpace: 'nowrap',
  },
  btnAdding: {
    background: 'linear-gradient(135deg, #10b981, #34d399)',
    boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
  },
  btnDisabled: {
    background: '#e9d5ff',
    color: '#a78bfa',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },

  // In-cart badge
  inCartBadge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#7c3aed',
    background: '#f3e8ff',
    padding: '0.26rem 0.7rem',
    borderRadius: '50px',
    alignSelf: 'flex-start',
    border: '1px solid #e9d5ff',
  },
};
