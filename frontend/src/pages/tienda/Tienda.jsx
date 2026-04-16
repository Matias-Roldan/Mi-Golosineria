import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductosDisponibles } from '../../api/productosApi';
import ProductoCard from '../../components/tienda/ProductoCard';
import Carrito from '../../components/tienda/Carrito';
import FormularioPedido from '../../components/tienda/FormularioPedido';
import { useCart } from '../../hooks/useCart';

// ─── useWindowSize ────────────────────────────────────────────────────
const useWindowSize = () => {
  const [size, setSize] = useState({ width: window.innerWidth });
  useEffect(() => {
    const handle = () => setSize({ width: window.innerWidth });
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);
  return size;
};

// ─── Staggered reveal ─────────────────────────────────────────────────
const useStaggeredVisible = (count) => {
  const [visibles, setVisibles] = useState([]);
  useEffect(() => {
    setVisibles([]); // eslint-disable-line react-hooks/set-state-in-effect
    Array.from({ length: count }).forEach((_, i) => {
      setTimeout(() => setVisibles((prev) => [...prev, i]), i * 55);
    });
  }, [count]);
  return visibles;
};

// ─── Skeleton card ────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div style={skeletonS.card}>
    <div style={skeletonS.img} />
    <div style={skeletonS.body}>
      <div style={{ ...skeletonS.line, width: '40%', height: '9px' }} />
      <div style={{ ...skeletonS.line, width: '80%', height: '15px', marginTop: '10px' }} />
      <div style={{ ...skeletonS.line, width: '55%', height: '9px', marginTop: '6px' }} />
      <div style={{ ...skeletonS.line, width: '100%', height: '38px', marginTop: '18px', borderRadius: '14px' }} />
    </div>
  </div>
);
const skeletonS = {
  card: { background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #f3e8ff' },
  img: { height: '250px', background: 'linear-gradient(90deg,#f3e8ff 25%,#e9d5ff 50%,#f3e8ff 75%)', backgroundSize: '600px 100%', animation: 'shimmer 1.4s ease infinite' },
  body: { padding: '1.2rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '4px' },
  line: { borderRadius: '8px', background: 'linear-gradient(90deg,#f3e8ff 25%,#e9d5ff 50%,#f3e8ff 75%)', backgroundSize: '600px 100%', animation: 'shimmer 1.4s ease infinite' },
};

// ─── Ticker ───────────────────────────────────────────────────────────
const TICKER_ITEMS = ['🍫 Chocolates importados', '🍬 Caramelos sin TACC', '🚀 Envíos en el día', '🎁 Ideal para eventos', '💜 Más de 50 sabores', '🍪 Galletas y snacks'];
const Ticker = () => {
  const text = TICKER_ITEMS.join('   ·   ') + '   ·   ';
  return (
    <div style={{ background: 'linear-gradient(90deg,#7c3aed,#a855f7)', overflow: 'hidden', whiteSpace: 'nowrap', padding: '0.5rem 0' }}>
      <span style={{ display: 'inline-block', animation: 'ticker 28s linear infinite', fontSize: '0.73rem', fontWeight: '800', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.05em' }}>
        {text}{text}
      </span>
    </div>
  );
};

// ─── PulseDot carrito ─────────────────────────────────────────────────
const PulseDot = ({ count }) => {
  const [bounce, setBounce] = useState(false);
  const prev = useRef(count);
  useEffect(() => {
    if (count !== prev.current && count > 0) {
      setBounce(true); // eslint-disable-line react-hooks/set-state-in-effect
      setTimeout(() => setBounce(false), 450);
      prev.current = count;
    }
  }, [count]);
  if (count === 0) return null;
  return (
    <span style={{
      background: 'white', color: '#a855f7', borderRadius: '50%',
      width: '20px', height: '20px', display: 'inline-flex',
      alignItems: 'center', justifyContent: 'center',
      fontSize: '0.65rem', fontWeight: '900', flexShrink: 0,
      transform: bounce ? 'scale(1.6)' : 'scale(1)',
      transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
    }}>{count}</span>
  );
};

// ─── Mapa emojis categoría ────────────────────────────────────────────
const CAT_EMOJI = { Todas: '✦', Chocolates: '🍫', Caramelos: '🍬', Chicles: '🫧', Galletas: '🍪', Snacks: '🍿', Bebidas: '🥤' };
const catEmoji = (c) => CAT_EMOJI[c] ?? '🏷';

// ─── Hero decorativo ──────────────────────────────────────────────────
function FloatingCandy({ emoji, style }) {
  const duration = useMemo(() => 5 + Math.random() * 3, []); // eslint-disable-line react-hooks/purity
  return (
    <motion.span
      style={{ position: 'absolute', fontSize: '2.5rem', lineHeight: 1, pointerEvents: 'none', userSelect: 'none', ...style }}
      animate={{ y: [0, -14, 0], rotate: [0, 8, -8, 0] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
    >
      {emoji}
    </motion.span>
  );
}

// ════════════════════════════════════════════════════════════════════
export default function Tienda() {
  const [productos, setProductos]       = useState([]);
  const [categorias, setCategorias]     = useState([]);
  const [categoriaActiva, setCatActiva] = useState('Todas');
  const [mostrarForm, setMostrarForm]   = useState(false);
  const [carritoOpen, setCarritoOpen]   = useState(false);
  const [loading, setLoading]           = useState(true);
  const [hoveredCat, setHoveredCat]     = useState(null);
  const { carrito }                     = useCart();
  const { width }                       = useWindowSize();
  const isMobile = width < 640;
  const totalItems = carrito.reduce((a, p) => a + p.cantidad, 0);
  const productosRef = useRef(null);

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

  const scrollToProductos = () => {
    productosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={T.page}>

      {/* ── Keyframes globales ── */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        *, *::before, *::after { box-sizing: border-box; }
      `}</style>

      {/* ══ NAVBAR ═══════════════════════════════════════════════════ */}
      <nav style={T.navbar}>
        <div style={{ ...T.navInner, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '0.875rem' : 0 }}>
          <div style={T.navBrand}>
            <span style={T.navLogo}>🍬</span>
            <span style={T.navName}>Mi Golosinería</span>
          </div>

          <motion.button
            style={{
              ...T.cartBtn,
              background: totalItems > 0
                ? 'linear-gradient(135deg,#a855f7,#e879f9)'
                : 'rgba(168,85,247,0.1)',
              border: totalItems > 0 ? 'none' : '1.5px solid #e9d5ff',
              color: totalItems > 0 ? 'white' : '#7c3aed',
              boxShadow: totalItems > 0 ? '0 4px 18px rgba(168,85,247,0.4)' : 'none',
            }}
            onClick={() => setCarritoOpen(true)}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>🛒</span>
            <span style={T.cartBtnLabel}>Carrito</span>
            <PulseDot count={totalItems} />
          </motion.button>
        </div>
      </nav>

      <Ticker />

      {/* ══ HERO ════════════════════════════════════════════════════ */}
      <section style={T.hero}>
        {/* Blobs de fondo */}
        <div style={{ ...T.blob, top: '-80px', right: '-60px', width: '380px', height: '380px', background: 'radial-gradient(circle,#e9d5ff 0%,transparent 70%)' }} />
        <div style={{ ...T.blob, bottom: '-60px', left: '-80px', width: '320px', height: '320px', background: 'radial-gradient(circle,#fce7f3 0%,transparent 70%)' }} />
        <div style={{ ...T.blob, top: '30%', left: '40%', width: '200px', height: '200px', background: 'radial-gradient(circle,#f3e8ff 0%,transparent 70%)' }} />

        {/* Candies flotantes */}
        <FloatingCandy emoji="🍫" style={{ top: '12%', right: isMobile ? '5%' : '12%' }} />
        <FloatingCandy emoji="🍭" style={{ top: '55%', right: isMobile ? '8%' : '20%' }} />
        <FloatingCandy emoji="🍪" style={{ bottom: '18%', left: isMobile ? '5%' : '10%' }} />
        <FloatingCandy emoji="🧁" style={{ top: '20%', left: isMobile ? '80%' : '30%' }} />

        {/* Contenido hero */}
        <div style={{ ...T.heroContent, padding: isMobile ? '0 1.25rem' : '0 2.5rem' }}>
          <motion.div
            style={T.heroEyebrow}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
          >
            <span style={T.heroEyebrowDot} />
            Tienda Online · Mondelez &amp; más
          </motion.div>

          <motion.h1
            style={{ ...T.heroTitle, fontSize: isMobile ? 'clamp(2.4rem,11vw,3.2rem)' : 'clamp(3rem,6vw,5rem)' }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.33, 1, 0.68, 1] }}
          >
            La mejor<br />
            <span style={T.heroTitleAccent}>golosinería</span>
          </motion.h1>

          <motion.p
            style={{ ...T.heroSub, fontSize: isMobile ? '0.95rem' : '1.1rem' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.33, 1, 0.68, 1] }}
          >
            Más de 50 sabores · chocolates importados · caramelos sin TACC<br />
            Envíos en el día a todo el país 🚀
          </motion.p>

          <motion.div
            style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.33, 1, 0.68, 1] }}
          >
            <motion.button
              style={T.heroCta}
              onClick={scrollToProductos}
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 380, damping: 20 }}
            >
              Ver productos ↓
            </motion.button>
            <motion.button
              style={T.heroCtaSecundario}
              onClick={() => setCarritoOpen(true)}
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 380, damping: 20 }}
            >
              🛒 Mi carrito
              {totalItems > 0 && <span style={T.heroCartCount}>{totalItems}</span>}
            </motion.button>
          </motion.div>

          {/* Stats rápidos */}
          <motion.div
            style={{ ...T.heroStats, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '0.75rem' : '2rem' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
          >
            {[['50+', 'Productos'], ['⚡', 'Envío express'], ['💜', 'Sin TACC']].map(([val, lbl]) => (
              <div key={lbl} style={T.heroStat}>
                <span style={T.heroStatVal}>{val}</span>
                <span style={T.heroStatLbl}>{lbl}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ PRODUCTOS ═══════════════════════════════════════════════ */}
      <div style={T.productosBg}>
      <div ref={productosRef} style={{ ...T.container, padding: isMobile ? '0 1rem 5rem' : '0 2.5rem 4rem' }}>

        {/* Título sección */}
        <div style={T.sectionHeader}>
          <h2 style={T.sectionTitle}>Nuestros productos</h2>
          <p style={T.sectionSub}>Seleccioná tus favoritos y armá tu pedido</p>
        </div>

        {/* ── Filtros categoría ── */}
        <div style={{ overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '4px', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: isMobile ? 'nowrap' : 'wrap' }}>
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
                </button>
              );
            })}
          </div>
        </div>

        {/* Separador con conteo */}
        {!loading && (
          <div style={T.sep}>
            <span style={T.sepLine} />
            <span style={T.sepChip}>
              {filtrados.length} producto{filtrados.length !== 1 ? 's' : ''}
            </span>
            <span style={T.sepLine} />
          </div>
        )}

        {/* Grid productos */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile
            ? 'repeat(auto-fill,minmax(158px,1fr))'
            : 'repeat(auto-fill,minmax(280px,1fr))',
          gap: isMobile ? '1rem' : '1.5rem',
          width: '100%',
        }}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : filtrados.length === 0
              ? <EmptyState onReset={() => setCatActiva('Todas')} />
              : filtrados.map((p, i) => (
                  <div key={p.id} style={{
                    animation: visibles.includes(i) ? 'fadeUp 0.42s ease both' : 'none',
                    opacity: visibles.includes(i) ? 1 : 0,
                  }}>
                    <ProductoCard producto={p} />
                  </div>
                ))
          }
        </div>
      </div>
      </div>

      {/* ══ CARRITO SIDEBAR ══════════════════════════════════════════ */}
      <Carrito
        isOpen={carritoOpen}
        onClose={() => setCarritoOpen(false)}
        onConfirmar={() => setMostrarForm(true)}
        productos={productos}
      />

      {mostrarForm && <FormularioPedido onCancelar={() => setMostrarForm(false)} />}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────
function EmptyState({ onReset }) {
  return (
    <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5rem 1rem', gap: '1rem' }}>
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
        <circle cx="48" cy="48" r="48" fill="#f3e8ff" />
        <text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fontSize="38">🍬</text>
      </svg>
      <p style={{ color: '#1e1333', fontWeight: '900', fontSize: '1.15rem', margin: 0, letterSpacing: '-0.02em' }}>
        Sin productos aquí
      </p>
      <p style={{ color: '#7c6a9e', fontSize: '0.875rem', margin: 0 }}>
        Esta categoría no tiene productos disponibles.
      </p>
      <motion.button
        style={{
          marginTop: '0.5rem', padding: '0.65rem 1.5rem', borderRadius: '50px',
          border: '1.5px solid #e9d5ff', background: 'white', color: '#7c3aed',
          fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit',
        }}
        onClick={onReset}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.96 }}
      >
        ✦ Ver todos los productos
      </motion.button>
    </div>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────
const T = {
  page: {
    minHeight: '100vh',
    background: '#fef9f0',
    fontFamily: "'Nunito', system-ui, sans-serif",
  },

  // Navbar
  navbar: {
    background: 'rgba(254,249,240,0.92)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderBottom: '1px solid #f3e8ff',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navInner: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '1rem 2.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navBrand: { display: 'flex', alignItems: 'center', gap: '0.6rem' },
  navLogo: { fontSize: '1.6rem', lineHeight: 1 },
  navName: {
    fontWeight: '900',
    fontSize: '1.2rem',
    color: '#1e1333',
    letterSpacing: '-0.03em',
  },
  cartBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderRadius: '50px',
    padding: '0.65rem 1.25rem',
    cursor: 'pointer',
    minHeight: '46px',
    minWidth: '120px',
    fontFamily: 'inherit',
    transition: 'background 0.2s ease, box-shadow 0.2s ease',
  },
  cartBtnLabel: {
    fontWeight: '800',
    fontSize: '0.9rem',
    letterSpacing: '0.01em',
  },

  // Hero
  hero: {
    background: 'linear-gradient(160deg,#fef9f0 0%,#f3e8ff 55%,#fce7f3 100%)',
    padding: '5rem 0 4.5rem',
    position: 'relative',
    overflow: 'hidden',
    minHeight: '520px',
    display: 'flex',
    alignItems: 'center',
  },
  blob: {
    position: 'absolute',
    borderRadius: '50%',
    opacity: 0.7,
    pointerEvents: 'none',
  },
  heroContent: {
    maxWidth: '680px',
    margin: '0 auto',
    width: '100%',
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  heroEyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: '800',
    color: '#a855f7',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
  },
  heroEyebrowDot: {
    width: '8px', height: '8px',
    borderRadius: '50%',
    background: '#a855f7',
    display: 'inline-block',
    boxShadow: '0 0 8px #a855f7',
  },
  heroTitle: {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontWeight: '900',
    color: '#1e1333',
    lineHeight: 1.05,
    letterSpacing: '-0.04em',
    margin: 0,
  },
  heroTitleAccent: {
    background: 'linear-gradient(135deg,#a855f7,#e879f9)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSub: {
    color: '#7c6a9e',
    fontWeight: '600',
    lineHeight: 1.65,
    margin: 0,
  },
  heroCta: {
    padding: '0.9rem 2rem',
    borderRadius: '50px',
    border: 'none',
    background: 'linear-gradient(135deg,#a855f7,#e879f9)',
    color: 'white',
    fontWeight: '900',
    fontSize: '1rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 8px 28px rgba(168,85,247,0.4)',
    letterSpacing: '0.01em',
  },
  heroCtaSecundario: {
    padding: '0.9rem 1.75rem',
    borderRadius: '50px',
    border: '2px solid #e9d5ff',
    background: 'white',
    color: '#7c3aed',
    fontWeight: '900',
    fontSize: '1rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    letterSpacing: '0.01em',
  },
  heroCartCount: {
    background: '#a855f7',
    color: 'white',
    borderRadius: '50%',
    width: '22px', height: '22px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: '900',
    flexShrink: 0,
  },
  heroStats: {
    display: 'flex',
    paddingTop: '0.5rem',
    borderTop: '1px solid #e9d5ff',
  },
  heroStat: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  heroStatVal: { fontWeight: '900', fontSize: '1.1rem', color: '#1e1333', letterSpacing: '-0.03em' },
  heroStatLbl: { fontSize: '0.82rem', color: '#7c6a9e', fontWeight: '600' },

  // Sección productos
  productosBg: {
    background: '#ffffff',
    borderTop: '3px solid #f3e8ff',
    boxShadow: 'inset 0 6px 32px rgba(168,85,247,0.05)',
    width: '100%',
  },
  container: { maxWidth: '1280px', margin: '0 auto', width: '100%' },
  sectionHeader: { paddingTop: '3rem', paddingBottom: '2rem' },
  sectionTitle: {
    fontSize: 'clamp(1.6rem,4vw,2.2rem)',
    fontWeight: '900',
    color: '#1e1333',
    letterSpacing: '-0.04em',
    fontFamily: 'Georgia, serif',
    margin: 0,
  },
  sectionSub: {
    color: '#7c6a9e',
    fontWeight: '600',
    fontSize: '0.95rem',
    marginTop: '0.4rem',
  },

  // Filtros
  pill: {
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.55rem 1.1rem', borderRadius: '50px',
    border: '1.5px solid #e9d5ff', background: 'white', color: '#6d28d9',
    fontWeight: '700', fontSize: '0.87rem', cursor: 'pointer',
    transition: 'all 0.2s ease', whiteSpace: 'nowrap', minHeight: '44px',
    fontFamily: 'inherit', boxShadow: '0 1px 4px rgba(192,132,252,0.08)',
  },
  pillHover: {
    borderColor: '#c084fc', background: '#faf5ff',
    boxShadow: '0 4px 14px rgba(192,132,252,0.2)', transform: 'translateY(-2px)',
  },
  pillActive: {
    background: 'linear-gradient(135deg,#c084fc,#e879f9)',
    color: 'white', border: '1.5px solid transparent', fontWeight: '800',
    boxShadow: '0 6px 20px rgba(192,132,252,0.45)', transform: 'translateY(-1px)',
  },

  // Separador
  sep: { display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0 0 1.75rem' },
  sepLine: { flex: 1, height: '1px', display: 'block', background: 'linear-gradient(90deg,transparent,#e9d5ff,transparent)' },
  sepChip: {
    fontSize: '0.65rem', fontWeight: '900', color: '#a78bfa',
    textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap',
    background: '#f3e8ff', padding: '0.25rem 0.8rem', borderRadius: '50px',
    border: '1px solid #e9d5ff',
  },
};
