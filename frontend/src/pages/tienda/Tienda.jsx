import { useEffect, useState, useRef } from 'react';
import { getProductosDisponibles } from '../../api/productosApi';
import ProductoCard from '../../components/tienda/ProductoCard';
import Carrito from '../../components/tienda/Carrito';
import FormularioPedido from '../../components/tienda/FormularioPedido';
import { useCart } from '../../hooks/useCart';

// ─── useWindowSize ───────────────────────────────────────────────────
const useWindowSize = () => {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const handle = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);
  return size;
};

// ─── Staggered reveal ────────────────────────────────────────────────
const useStaggeredVisible = (count) => {
  const [visibles, setVisibles] = useState([]);
  useEffect(() => {
    setVisibles([]);
    Array.from({ length: count }).forEach((_, i) => {
      setTimeout(() => setVisibles((prev) => [...prev, i]), i * 50);
    });
  }, [count]);
  return visibles;
};

// ─── Skeleton card ───────────────────────────────────────────────────
const SkeletonCard = () => (
  <div style={skeletonStyles.card}>
    <div style={skeletonStyles.img} />
    <div style={skeletonStyles.body}>
      <div style={{ ...skeletonStyles.line, width: '45%', height: '10px' }} />
      <div style={{ ...skeletonStyles.line, width: '80%', height: '14px', marginTop: '8px' }} />
      <div style={{ ...skeletonStyles.line, width: '60%', height: '10px', marginTop: '6px' }} />
      <div style={{ ...skeletonStyles.line, width: '100%', height: '36px', marginTop: '16px', borderRadius: '10px' }} />
    </div>
  </div>
);

const skeletonStyles = {
  card: {
    background: 'white',
    borderRadius: '20px',
    overflow: 'hidden',
    border: '1px solid #e9d5ff',
  },
  img: {
    height: '160px',
    background: 'linear-gradient(90deg, #f3e8ff 25%, #e9d5ff 50%, #f3e8ff 75%)',
    backgroundSize: '400px 100%',
    animation: 'shimmer 1.4s ease infinite',
  },
  body: { padding: '1rem', display: 'flex', flexDirection: 'column', gap: '4px' },
  line: {
    borderRadius: '6px',
    background: 'linear-gradient(90deg, #f3e8ff 25%, #e9d5ff 50%, #f3e8ff 75%)',
    backgroundSize: '400px 100%',
    animation: 'shimmer 1.4s ease infinite',
  },
};

// ─── Ruido SVG de fondo ──────────────────────────────────────────────
const NoiseBg = () => (
  <svg style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, opacity: 0.025 }}>
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noise)" />
  </svg>
);

// ─── Decoración header ───────────────────────────────────────────────
const HeaderBlobs = () => (
  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 1200 140" preserveAspectRatio="xMidYMid slice">
    <circle cx="1100" cy="-20" r="130" fill="rgba(255,255,255,0.12)" />
    <circle cx="950"  cy="120"  r="80"  fill="rgba(255,255,255,0.08)" />
    <circle cx="80"   cy="130"  r="90"  fill="rgba(255,255,255,0.07)" />
    <circle cx="300"  cy="-30"  r="60"  fill="rgba(255,255,255,0.1)"  />
  </svg>
);

// ─── PulseDot carrito ────────────────────────────────────────────────
const PulseDot = ({ count }) => {
  const [bounce, setBounce] = useState(false);
  const prev = useRef(count);
  useEffect(() => {
    if (count !== prev.current && count > 0) {
      setBounce(true);
      setTimeout(() => setBounce(false), 450);
      prev.current = count;
    }
  }, [count]);
  if (count === 0) return null;
  return (
    <span style={{
      background: 'white',
      color: '#c084fc',
      borderRadius: '50%',
      width: '20px', height: '20px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.68rem',
      fontWeight: '900',
      transform: bounce ? 'scale(1.55)' : 'scale(1)',
      transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      flexShrink: 0,
    }}>
      {count}
    </span>
  );
};

// ─── Mapa emojis categoría ───────────────────────────────────────────
const CAT_EMOJI = {
  Todas: '✦', Chocolates: '🍫', Caramelos: '🍬',
  Chicles: '🫧', Galletas: '🍪', Snacks: '🍿', Bebidas: '🥤',
};
const catEmoji = (c) => CAT_EMOJI[c] ?? '🏷';

// ════════════════════════════════════════════════════════════════════
export default function Tienda() {
  const [productos, setProductos]         = useState([]);
  const [categorias, setCategorias]       = useState([]);
  const [categoriaActiva, setCatActiva]   = useState('Todas');
  const [mostrarForm, setMostrarForm]     = useState(false);
  const [loading, setLoading]             = useState(true);
  const [hoveredCat, setHoveredCat]       = useState(null);
  const [hoveredCart, setHoveredCart]     = useState(false);
  const { carrito }                       = useCart();
  const { width }                         = useWindowSize();
  const isMobile  = width < 768;
  const isTablet  = width < 1024;
  const totalItems = carrito.reduce((a, p) => a + p.cantidad, 0);

  useEffect(() => {
    getProductosDisponibles().then(({ data }) => {
      setProductos(data);
      setCategorias(['Todas', ...new Set(data.map((p) => p.categoria))]);
      setLoading(false);
    });
  }, []);

  const filtrados = categoriaActiva === 'Todas'
    ? productos
    : productos.filter((p) => p.categoria === categoriaActiva);

  const visibles = useStaggeredVisible(filtrados.length);

  return (
    <div style={T.page}>
      <NoiseBg />

      {/* ── Keyframes globales ── */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        @keyframes headerIn {
          from { opacity:0; transform:translateY(-12px); }
          to   { opacity:1; transform:translateY(0);     }
        }
        *, *::before, *::after { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
        html { scroll-behavior: smooth; }
      `}</style>

      {/* ══ HEADER ═══════════════════════════════════════════════════ */}
      <header style={T.header}>
        <HeaderBlobs />
        <div style={{ ...T.headerInner, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '1.25rem' : 0, animation: 'headerIn 0.5s ease both' }}>

          {/* Logo + copy */}
          <div style={T.headerLeft}>
            
            <h1 style={{ ...T.headerTitle, fontSize: isMobile ? 'clamp(1.5rem,7vw,1.9rem)' : 'clamp(1.8rem,3vw,2.2rem)' }}>
              Mi Golosinería
            </h1>
            <p style={T.headerSub}>Mondelez &amp; más · Envíos en el día 🚀</p>
          </div>

          {/* Botón carrito */}
          <button
            style={{
              ...T.cartBtn,
              transform: hoveredCart ? 'translateY(-3px) scale(1.04)' : 'none',
              boxShadow: hoveredCart
                ? '0 12px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.35)'
                : '0 4px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.25)',
            }}
            onMouseEnter={() => setHoveredCart(true)}
            onMouseLeave={() => setHoveredCart(false)}
          >
            <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>🛒</span>
            <span style={T.cartBtnLabel}>Carrito</span>
            <PulseDot count={totalItems} />
          </button>
        </div>
      </header>

      {/* ══ CONTENIDO ════════════════════════════════════════════════ */}
      <div style={{ ...T.container, padding: isMobile ? '0 1rem 7rem' : isTablet ? '0 1.5rem 5rem' : '0 2.5rem 3rem' }}>

        {/* ── Filtros de categoría ── */}
        <section style={T.filtrosSection}>
          <p style={T.filtrosEyebrow}>Categorías</p>
          <div style={{ overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '4px' }}>
            <div style={{ ...T.filtrosRow, flexWrap: isMobile ? 'nowrap' : 'wrap' }}>
              {categorias.map((cat) => {
                const active = cat === categoriaActiva;
                const hov    = hoveredCat === cat;
                return (
                  <button
                    key={cat}
                    style={{
                      ...T.pill,
                      ...(active ? T.pillActive : hov ? T.pillHover : {}),
                      flexShrink: isMobile ? 0 : undefined,
                    }}
                    onClick={() => setCatActiva(cat)}
                    onMouseEnter={() => setHoveredCat(cat)}
                    onMouseLeave={() => setHoveredCat(null)}
                  >
                    <span style={{ fontSize: '1rem', lineHeight: 1 }}>{catEmoji(cat)}</span>
                    <span>{cat}</span>
                    {active && <span style={T.pillActivePip} />}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Separador con conteo ── */}
        {!loading && (
          <div style={T.sep}>
            <span style={T.sepLine} />
            <span style={T.sepChip}>
              {filtrados.length} producto{filtrados.length !== 1 ? 's' : ''}
            </span>
            <span style={T.sepLine} />
          </div>
        )}

        {/* ── Layout productos + carrito ── */}
        <div style={{
          ...T.layout,
          gridTemplateColumns: !isMobile && !isTablet ? '1fr 340px' : '1fr',
          gap: isMobile ? '1rem' : '2rem',
        }}>

          {/* Grid */}
          <div style={{
            ...T.grid,
            gridTemplateColumns: isMobile
              ? 'repeat(auto-fill, minmax(152px, 1fr))'
              : 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: isMobile ? '0.875rem' : '1.25rem',
          }}>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : filtrados.length === 0
                ? <EmptyState onReset={() => setCatActiva('Todas')} />
                : filtrados.map((p, i) => (
                    <div key={p.id} style={{
                      animation: visibles.includes(i) ? 'fadeUp 0.38s ease both' : 'none',
                      opacity: visibles.includes(i) ? 1 : 0,
                    }}>
                      <ProductoCard producto={p} />
                    </div>
                  ))
            }
          </div>

          {/* Carrito lateral desktop */}
          {!isMobile && !isTablet && (
            <aside style={T.aside}>
              <Carrito onConfirmar={() => setMostrarForm(true)} productos={productos} />
            </aside>
          )}
        </div>
      </div>

      {/* ── Carrito bottom sheet móvil/tablet ── */}
      {(isMobile || isTablet) && (
        <div style={T.cartSheet}>
          <Carrito onConfirmar={() => setMostrarForm(true)} productos={productos} />
        </div>
      )}

      {mostrarForm && <FormularioPedido onCancelar={() => setMostrarForm(false)} />}
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────
function EmptyState({ onReset }) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5rem 1rem', gap: '1rem' }}>
      {/* SVG ilustración inline */}
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
        <circle cx="48" cy="48" r="48" fill="#f3e8ff" />
        <text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fontSize="38">🍬</text>
      </svg>
      <p style={{ color: '#1e1333', fontWeight: '800', fontSize: '1.1rem', margin: 0, fontFamily: 'Georgia, serif' }}>
        Sin productos aquí
      </p>
      <p style={{ color: '#7c6a9e', fontSize: '0.875rem', margin: 0 }}>
        Esta categoría no tiene productos disponibles.
      </p>
      <button
        style={{
          marginTop: '0.5rem',
          padding: '0.6rem 1.4rem',
          borderRadius: '50px',
          border: '1.5px solid #e9d5ff',
          background: hov ? '#f3e8ff' : 'white',
          color: '#7c3aed',
          fontWeight: '700',
          fontSize: '0.875rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontFamily: 'inherit',
          transform: hov ? 'translateY(-1px)' : 'none',
        }}
        onClick={onReset}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
      >
        ✦ Ver todos los productos
      </button>
    </div>
  );
}

// ─── Estilos Tienda ──────────────────────────────────────────────────
const T = {
  page: {
    minHeight: '100vh',
    background: '#faf5ff',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    position: 'relative',
  },

  // Header
  header: {
    background: 'linear-gradient(130deg, #a855f7 0%, #c084fc 40%, #e879f9 75%, #f0abfc 100%)',
    padding: '1.75rem 0',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 8px 48px rgba(168,85,247,0.3)',
  },
  headerInner: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 2.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  headerLeft: { display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  eyebrow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.68rem',
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
  },
  eyebrowDot: {
    width: '6px', height: '6px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.9)',
    display: 'inline-block',
    boxShadow: '0 0 6px rgba(255,255,255,0.8)',
  },
  headerTitle: {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontWeight: '900',
    color: 'white',
    margin: 0,
    letterSpacing: '-0.03em',
    lineHeight: 1.08,
    textShadow: '0 2px 12px rgba(0,0,0,0.15)',
  },
  headerSub: {
    fontSize: '0.82rem',
    color: 'rgba(255,255,255,0.8)',
    margin: 0,
    fontWeight: '400',
  },
  cartBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(255,255,255,0.18)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1.5px solid rgba(255,255,255,0.38)',
    borderRadius: '50px',
    padding: '0.65rem 1.25rem',
    cursor: 'pointer',
    transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
    minHeight: '48px',
    minWidth: '120px',
    color: 'white',
    fontFamily: 'inherit',
  },
  cartBtnLabel: {
    fontWeight: '700',
    fontSize: '0.88rem',
    color: 'white',
    letterSpacing: '0.01em',
  },

  // Filtros
  filtrosSection: { marginTop: '0.25rem', marginBottom: '0.25rem' },
  filtrosEyebrow: {
    fontSize: '0.68rem',
    fontWeight: '700',
    color: '#a78bfa',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    margin: '0 0 0.75rem 0.1rem',
  },
  filtrosRow: { display: 'flex', gap: '0.5rem' },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.55rem 1.1rem',
    borderRadius: '50px',
    border: '1.5px solid #e9d5ff',
    background: 'white',
    color: '#6d28d9',
    fontWeight: '600',
    fontSize: '0.845rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    minHeight: '44px',
    fontFamily: 'inherit',
    boxShadow: '0 1px 4px rgba(192,132,252,0.08)',
  },
  pillHover: {
    borderColor: '#c084fc',
    background: '#faf5ff',
    boxShadow: '0 4px 14px rgba(192,132,252,0.2)',
    transform: 'translateY(-2px)',
  },
  pillActive: {
    background: 'linear-gradient(135deg,#c084fc,#e879f9)',
    color: 'white',
    border: '1.5px solid transparent',
    fontWeight: '700',
    boxShadow: '0 6px 20px rgba(192,132,252,0.45)',
    transform: 'translateY(-1px)',
  },
  pillActivePip: {
    width: '5px', height: '5px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.85)',
    flexShrink: 0,
  },

  // Separador
  sep: { display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.75rem 0 1.5rem' },
  sepLine: {
    flex: 1, height: '1px', display: 'block',
    background: 'linear-gradient(90deg, transparent, #e9d5ff, transparent)',
  },
  sepChip: {
    fontSize: '0.68rem',
    fontWeight: '800',
    color: '#a78bfa',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    whiteSpace: 'nowrap',
    background: '#f3e8ff',
    padding: '0.25rem 0.75rem',
    borderRadius: '50px',
    border: '1px solid #e9d5ff',
  },

  // Layout
  layout: { display: 'grid', alignItems: 'start' },
  grid:   { display: 'grid' },
  aside:  { position: 'sticky', top: '1.5rem' },
  container: { maxWidth: '1280px', margin: '2rem auto 0', position: 'relative', zIndex: 1 },
  cartSheet: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    zIndex: 200,
    boxShadow: '0 -12px 48px rgba(168,85,247,0.18)',
  },
};