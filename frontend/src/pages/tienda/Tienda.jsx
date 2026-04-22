import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { getProductosDisponibles } from '../../api/productosApi';
import Carrito from '../../components/tienda/Carrito';
import FormularioPedido from '../../components/tienda/FormularioPedido';
import HeroSection from '../../components/tienda/HeroSection';
import ProductosGrid from '../../components/tienda/ProductosGrid';
import { useCart } from '../../hooks/useCart';
import { T } from '../../components/tienda/tiendaStyles';

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

// ════════════════════════════════════════════════════════════════════
export default function Tienda() {
  const [productos, setProductos]       = useState([]);
  const [categorias, setCategorias]     = useState([]);
  const [categoriaActiva, setCatActiva] = useState('Todas');
  const [mostrarForm, setMostrarForm]   = useState(false);
  const [carritoOpen, setCarritoOpen]   = useState(false);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(false);
  const { carrito }                     = useCart();
  const { width }                       = useWindowSize();
  const isMobile = width < 640;
  const totalItems = carrito.reduce((a, p) => a + p.cantidad, 0);
  const productosRef = useRef(null);

  useEffect(() => {
    getProductosDisponibles()
      .then(({ data }) => {
        setProductos(data);
        setCategorias(['Todas', ...new Set(data.map((p) => p.categoria))]);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const filtrados = categoriaActiva === 'Todas'
    ? productos
    : productos.filter((p) => p.categoria === categoriaActiva);

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

      <HeroSection
        isMobile={isMobile}
        totalItems={totalItems}
        onScrollToProductos={scrollToProductos}
        onOpenCarrito={() => setCarritoOpen(true)}
      />

      <div ref={productosRef}>
        <ProductosGrid
          loading={loading}
          error={error}
          filtrados={filtrados}
          categorias={categorias}
          categoriaActiva={categoriaActiva}
          onCategoriaChange={setCatActiva}
          onResetCategoria={() => setCatActiva('Todas')}
          isMobile={isMobile}
        />
      </div>

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
