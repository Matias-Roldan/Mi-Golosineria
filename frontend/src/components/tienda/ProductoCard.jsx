import { useState } from 'react';
import { useCart } from '../../hooks/useCart';

// ─── Colores semánticos de stock ─────────────────────────────────────
const stockConfig = (n) => {
  if (n === 0) return { label: 'Sin stock',      color: '#ef4444', bg: '#fef2f2', border: '#fecaca', dot: '#ef4444' };
  if (n <= 3)  return { label: `Últimas ${n}`,   color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', dot: '#f59e0b' };
  if (n <= 8)  return { label: `${n} disponibles`, color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0', dot: '#10b981' };
  return             { label: 'En stock',         color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0', dot: '#10b981' };
};

// ─── Paleta de badges por categoría ─────────────────────────────────
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
  const [hovered,    setHovered]    = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);
  const [adding,     setAdding]     = useState(false);
  const [imgError,   setImgError]   = useState(false);

  const itemEnCarrito  = carrito.find((p) => p.id === producto.id);
  const cantCarrito    = itemEnCarrito?.cantidad ?? 0;
  const stockDisponible = producto.stock - cantCarrito;
  const stock          = stockConfig(stockDisponible);
  const badge          = catStyle(producto.categoria);
  const sinStock       = stockDisponible === 0;

  const handleAgregar = () => {
    if (sinStock || adding) return;
    setAdding(true);
    agregar(producto);
    setTimeout(() => setAdding(false), 600);
  };

  return (
    <article
      style={{
        ...C.card,
        transform: hovered && !sinStock ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered && !sinStock
          ? '0 20px 52px rgba(168,85,247,0.22), 0 0 0 2px #c084fc'
          : '0 2px 12px rgba(168,85,247,0.08), 0 0 0 1px #ede9fe',
        opacity: sinStock ? 0.68 : 1,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Imagen ── */}
      <div style={C.imgWrap}>
        {producto.imagen_url && !imgError ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            style={{
              ...C.img,
              transform: hovered && !sinStock ? 'scale(1.06)' : 'scale(1)',
            }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={C.imgPlaceholder}>
            <span style={{ fontSize: '3.2rem', filter: 'drop-shadow(0 4px 8px rgba(192,132,252,0.3))' }}>🍬</span>
          </div>
        )}

        {/* Badge de categoría flotante */}
        <span style={{ ...C.catBadge, background: badge.bg, color: badge.color }}>
          {producto.categoria}
        </span>

        {/* Overlay sin stock */}
        {sinStock && (
          <div style={C.outOfStockOverlay}>
            <span style={C.outOfStockLabel}>Sin stock</span>
          </div>
        )}
      </div>

      {/* ── Cuerpo ── */}
      <div style={C.body}>

        {/* Nombre */}
        <h3 style={C.nombre}>{producto.nombre}</h3>

        {/* Descripción */}
        {producto.descripcion && (
          <p style={C.descripcion}>{producto.descripcion}</p>
        )}

        {/* Indicador de stock */}
        <div style={{ ...C.stockPill, background: stock.bg, border: `1px solid ${stock.border}` }}>
          <span style={{ ...C.stockDot, background: stock.dot, boxShadow: `0 0 6px ${stock.dot}` }} />
          <span style={{ ...C.stockLabel, color: stock.color }}>{stock.label}</span>
        </div>

        {/* Footer precio + botón */}
        <div style={C.footer}>
          <div style={C.precioWrap}>
            <span style={C.precioLabel}>precio</span>
            <span style={C.precio}>
              ${Number(producto.precio).toLocaleString('es-AR')}
            </span>
          </div>

          <button
            style={{
              ...C.btn,
              ...(sinStock ? C.btnDisabled : adding ? C.btnAdding : btnHovered ? C.btnHover : {}),
            }}
            onClick={handleAgregar}
            disabled={sinStock}
            onMouseEnter={() => setBtnHovered(true)}
            onMouseLeave={() => setBtnHovered(false)}
          >
            {adding ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={C.checkmark}>✓</span> Listo
              </span>
            ) : sinStock ? (
              'Agotado'
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ fontSize: '1rem', lineHeight: 1 }}>＋</span> Agregar
              </span>
            )}
          </button>
        </div>

        {/* Cantidad en carrito */}
        {cantCarrito > 0 && (
          <div style={C.inCartBadge}>
            🛒 {cantCarrito} en tu carrito
          </div>
        )}
      </div>
    </article>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────
const C = {
  card: {
    background: 'white',
    borderRadius: '22px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.25s cubic-bezier(0.34,1.2,0.64,1), box-shadow 0.25s ease, opacity 0.2s ease',
    cursor: 'default',
    fontFamily: "'Nunito', system-ui, sans-serif",
  },

  // Imagen
  imgWrap: {
    height: '190px',
    background: 'linear-gradient(145deg, #f3e8ff 0%, #fce7f3 50%, #faf5ff 100%)',
    position: 'relative',
    overflow: 'hidden',
    flexShrink: 0,
  },
  img: {
    width: '100%', height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s cubic-bezier(0.34,1.2,0.64,1)',
    display: 'block',
  },
  imgPlaceholder: {
    width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  catBadge: {
    position: 'absolute',
    top: '10px', left: '10px',
    fontSize: '0.68rem',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    padding: '0.2rem 0.6rem',
    borderRadius: '50px',
  },
  outOfStockOverlay: {
    position: 'absolute', inset: 0,
    background: 'rgba(249,250,251,0.75)',
    backdropFilter: 'blur(3px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  outOfStockLabel: {
    background: '#ef4444',
    color: 'white',
    fontSize: '0.72rem',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    padding: '0.3rem 0.8rem',
    borderRadius: '50px',
  },

  // Cuerpo
  body: {
    padding: '1rem 1.1rem 1.1rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: '0.5rem',
  },
  nombre: {
    fontSize: '1rem',
    fontWeight: '800',
    color: '#1e1333',
    margin: 0,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  descripcion: {
    fontSize: '0.8rem',
    color: '#7c6a9e',
    margin: 0,
    lineHeight: 1.5,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },

  // Stock pill
  stockPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.25rem 0.65rem',
    borderRadius: '50px',
    alignSelf: 'flex-start',
  },
  stockDot: {
    width: '6px', height: '6px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  stockLabel: {
    fontSize: '0.72rem',
    fontWeight: '700',
    letterSpacing: '0.02em',
  },

  // Footer
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: '0.25rem',
    gap: '0.5rem',
  },
  precioWrap: { display: 'flex', flexDirection: 'column', lineHeight: 1.1 },
  precioLabel: {
    fontSize: '0.6rem',
    fontWeight: '700',
    color: '#a78bfa',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  },
  precio: {
    fontSize: '1.3rem',
    fontWeight: '900',
    color: '#1e1333',
    letterSpacing: '-0.03em',
    fontFamily: 'Georgia, serif',
  },

  // Botón
  btn: {
    padding: '0.6rem 1.1rem',
    borderRadius: '14px',
    border: 'none',
    background: 'linear-gradient(135deg, #a855f7, #e879f9)',
    color: 'white',
    fontWeight: '800',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.34,1.2,0.64,1)',
    minHeight: '44px',
    minWidth: '96px',
    fontFamily: "'Nunito', inherit",
    letterSpacing: '0.01em',
    boxShadow: '0 4px 16px rgba(168,85,247,0.35)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  btnHover: {
    transform: 'translateY(-2px) scale(1.05)',
    boxShadow: '0 10px 28px rgba(168,85,247,0.5)',
  },
  btnAdding: {
    background: 'linear-gradient(135deg, #10b981, #34d399)',
    boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
    transform: 'scale(0.97)',
  },
  btnDisabled: {
    background: '#e5e7eb',
    color: '#9ca3af',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  checkmark: {
    fontSize: '0.9rem',
    fontWeight: '900',
  },

  // In-cart badge
  inCartBadge: {
    fontSize: '0.72rem',
    fontWeight: '600',
    color: '#7c3aed',
    background: '#f3e8ff',
    padding: '0.25rem 0.65rem',
    borderRadius: '50px',
    alignSelf: 'flex-start',
    border: '1px solid #e9d5ff',
  },
};