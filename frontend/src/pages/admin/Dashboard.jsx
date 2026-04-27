import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import Sidebar from '../../components/admin/Sidebar';
import StatsCard from '../../components/admin/StatsCard';
import { useSidebar } from '../../stores/useSidebarStore';
import {
  getKpis, getVentasDiarias, getTopProductos, getHeatmap,
  getAnalisisPareto, getAnalisisRFM, getSaludStock, getCrossSelling,
  getEstadoResultados,
} from '../../api/adminApi';

// ─── Animation variant ────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.38, ease: 'easeOut' },
  }),
};

// ─── Skeleton ─────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <>
      <style>{`@keyframes dp { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ background: '#1a1a24', borderRadius: '16px', height: '110px', border: '1px solid #2a2a3a', animation: 'dp 1.5s ease-in-out infinite' }} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#1a1a24', borderRadius: '16px', height: '280px', border: '1px solid #2a2a3a', animation: 'dp 1.5s ease-in-out infinite' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[140, 120].map((h, i) => (
            <div key={i} style={{ background: '#1a1a24', borderRadius: '16px', height: `${h}px`, border: '1px solid #2a2a3a', animation: 'dp 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Custom Bar Tooltip ───────────────────────────────────────────────
function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  const formatted = new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  }).format(val);
  return (
    <div style={{ background: '#1a1a24', border: '1px solid #3a3a4a', borderRadius: '10px', padding: '0.5rem 0.9rem' }}>
      <div style={{ color: '#8b8b9e', fontSize: '0.62rem', fontWeight: '600', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Día {label}
      </div>
      <div style={{ color: '#c084fc', fontWeight: '800', fontSize: '0.9rem' }}>{formatted}</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const { toggle, isMobile } = useSidebar();

  const { data, isLoading: loading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () =>
      Promise.all([
        getKpis(), getVentasDiarias(), getTopProductos(),
        getHeatmap(), getAnalisisPareto(), getAnalisisRFM(), getSaludStock(), getCrossSelling(),
        getEstadoResultados(),
      ]).then(([kpisRes, ventasRes, topRes, heatRes, paretoRes, rfmRes, stockRes, crossRes, erRes]) => ({
        kpis:             kpisRes.data,
        ventas:           ventasRes.data,
        topProductos:     topRes.data,
        heatmap:          heatRes.data ?? [],
        pareto:           paretoRes.data ?? [],
        rfm:              rfmRes.data ?? [],
        stock:            stockRes.data ?? [],
        crossSelling:     crossRes.data ?? [],
        estadoResultados: erRes.data ?? null,
      })),
  });

  const kpis             = data?.kpis             ?? null;
  const ventas           = data?.ventas           ?? [];
  const topProductos     = data?.topProductos     ?? [];
  const heatmap          = data?.heatmap          ?? [];
  const pareto           = data?.pareto           ?? [];
  const rfm              = data?.rfm              ?? [];
  const stock            = data?.stock            ?? [];
  const crossSelling     = data?.crossSelling     ?? [];
  const estadoResultados = data?.estadoResultados ?? null;

  const formatPeso = (n) => {
    const num = parseFloat(n);
    if (isNaN(num)) return '$0';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
    }).format(num);
  };

  const maxUnidades = Math.max(...topProductos.map((p) => parseFloat(p.unidades) || 0), 1);
  const maxStock    = Math.max(...stock.map((s) => parseFloat(s.stock) || 0), 1);

  // Greeting
  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buen día' : hora < 18 ? 'Buenas tardes' : 'Buenas noches';
  const hoy = new Date().toLocaleDateString('es-AR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  // Sparkline data – last 10 days of ventas
  const sparkData = ventas.slice(-10).map((v) => ({ v: parseFloat(v.ingresos) || 0 }));

  // Bar chart data
  const chartData = ventas.map((v) => ({
    dia: String(new Date(v.fecha).getDate()),
    ingresos: parseFloat(v.ingresos) || 0,
  }));

  return (
    <div style={D.layout}>
      <style>{`
        #dash-search::placeholder { color: #4a4a5e; }
        #dash-search:focus { outline: none; }
      `}</style>

      <Sidebar />

      <main style={{ ...D.main, marginLeft: isMobile ? 0 : '240px' }}>

        {/* ── Header ── */}
        <motion.div style={D.header} initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            {isMobile && (
              <button
                onClick={toggle}
                style={{ background: '#1a1a24', border: '1px solid #2a2a3a', color: '#f1f1f3', borderRadius: '10px', padding: '0.45rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.2rem', flexShrink: 0 }}
              >
                ☰
              </button>
            )}
            <div>
              <h1 style={D.title}>{saludo}, Administrador 👋</h1>
              <p style={D.subtitle}>{hoy}</p>
            </div>
          </div>
          <div style={D.searchBox}>
            <span style={{ fontSize: '0.9rem' }}>🔍</span>
            <input id="dash-search" style={D.searchInput} placeholder="Buscar..." />
          </div>
        </motion.div>

        {loading ? (
          <Skeleton />
        ) : (
          <>
            {/* ── KPI Cards ── */}
            <div style={D.kpiGrid}>
              {[
                { icon: '💰', label: 'Ventas del mes',  value: formatPeso(kpis?.total_ventas_mes), color: '#a855f7' },
                { icon: '🛒', label: 'Pedidos',         value: String(kpis?.cantidad_pedidos_mes ?? '0'), color: '#3b82f6' },
                { icon: '🎯', label: 'Ticket promedio', value: formatPeso(kpis?.ticket_promedio),  color: '#10b981' },
                { icon: '👥', label: 'Clientes únicos', value: String(kpis?.clientes_unicos ?? '0'), color: '#f59e0b' },
              ].map((card, i) => (
                <motion.div key={card.label} custom={i + 1} initial="hidden" animate="visible" variants={fadeUp}>
                  <StatsCard {...card} sparkData={sparkData} />
                </motion.div>
              ))}
            </div>

            {/* ── Main row: chart + side cards ── */}
            <div style={D.mainRow}>

              {/* Bar chart */}
              {ventas.length > 0 && (
                <motion.div style={D.card} custom={5} initial="hidden" animate="visible" variants={fadeUp}>
                  <div style={D.cardHeader}>
                    <div>
                      <h2 style={D.cardTitle}>Ventas últimos 30 días</h2>
                      <p style={D.cardSub}>Ingresos diarios en ARS</p>
                    </div>
                    <div style={D.legendChip}>
                      <span style={D.legendDot} />
                      <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#c084fc' }}>Ingresos</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData} margin={{ top: 0, right: 4, left: -20, bottom: 0 }} barCategoryGap="35%">
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor="#c084fc" />
                          <stop offset="100%" stopColor="#7c3aed" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="#1e1e2e" strokeDasharray="4 4" />
                      <XAxis
                        dataKey="dia"
                        tick={{ fill: '#8b8b9e', fontSize: 10, fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                        interval={4}
                      />
                      <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(168,85,247,0.07)' }} />
                      <Bar dataKey="ingresos" radius={[4, 4, 0, 0]} fill="url(#barGrad)" />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              )}

              {/* Side column */}
              <div style={D.sideColumn}>

                {/* Top vendido */}
                {topProductos.length > 0 && (
                  <motion.div style={D.card} custom={6} initial="hidden" animate="visible" variants={fadeUp}>
                    <h2 style={{ ...D.cardTitle, marginBottom: '0.2rem' }}>🏆 Top Vendido</h2>
                    <p style={{ ...D.cardSub, marginBottom: '1rem' }}>Producto #1 del mes</p>

                    <div style={D.heroCard}>
                      <div style={D.heroRank}>1</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fff', marginBottom: '0.25rem', wordBreak: 'break-word', lineHeight: 1.3 }}>
                          {topProductos[0].nombre}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#8b8b9e' }}>
                          {topProductos[0].unidades} unidades vendidas
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '1rem', fontWeight: '900', color: '#c084fc' }}>
                          {formatPeso(topProductos[0].ingresos)}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.85rem' }}>
                      {topProductos.slice(1, 4).map((p, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ fontSize: '0.68rem', color: '#4a4a5e', fontWeight: '700', width: '14px', textAlign: 'right' }}>{i + 2}</span>
                          <span style={{ flex: 1, fontSize: '0.78rem', color: '#c4c4d4', fontWeight: '600', wordBreak: 'break-word' }}>{p.nombre}</span>
                          <span style={{ fontSize: '0.72rem', color: '#a855f7', fontWeight: '700', flexShrink: 0 }}>{p.unidades} ud.</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Indicadores clave */}
                {kpis && (
                  <motion.div style={D.card} custom={7} initial="hidden" animate="visible" variants={fadeUp}>
                    <h2 style={{ ...D.cardTitle, marginBottom: '0.2rem' }}>📊 Indicadores</h2>
                    <p style={{ ...D.cardSub, marginBottom: '1rem' }}>Productos destacados</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {[
                        { label: '⭐ Mayor ingreso',  value: kpis?.producto_mas_ingresos ?? '—', color: '#f59e0b' },
                        { label: '🔥 Más vendido',    value: kpis?.producto_mas_vendido ?? '—',  color: '#a855f7' },
                      ].map((item, i) => (
                        <div key={i} style={D.miniCard}>
                          <div style={{ fontSize: '0.6rem', color: '#8b8b9e', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
                            {item.label}
                          </div>
                          <div style={{ fontSize: '0.82rem', fontWeight: '800', color: item.color, wordBreak: 'break-word', lineHeight: 1.3 }}>
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* ── Salud del stock ── */}
            {stock.length > 0 && (
              <motion.div style={D.cardFull} custom={8} initial="hidden" animate="visible" variants={fadeUp}>
                <div style={D.cardHeader}>
                  <div>
                    <h2 style={D.cardTitle}>Salud del Stock</h2>
                    <p style={D.cardSub}>Estado actual de inventario por producto</p>
                  </div>
                </div>
                <div style={D.list}>
                  {stock.map((p, i) => {
                    const estado = (p.estado_stock ?? '').toLowerCase();
                    const sc = estado === 'crítico' || estado === 'critico'
                      ? '#ef4444'
                      : estado === 'bajo'
                      ? '#f59e0b'
                      : '#10b981';
                    const stockActual = parseFloat(p.stock) || 0;
                    const barPct = Math.min((stockActual / maxStock) * 100, 100);
                    const margen = parseFloat(p.precio) - parseFloat(p.precio_costo);
                    const margenPct = parseFloat(p.precio_costo) > 0
                      ? ((margen / parseFloat(p.precio_costo)) * 100).toFixed(0)
                      : null;
                    return (
                      <div key={i} style={D.row}>
                        <div style={{ ...D.badge, background: `${sc}18`, color: sc, fontSize: '0.62rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {p.estado_stock ?? '—'}
                        </div>
                        <div style={D.meta}>
                          <div style={D.name}>{p.nombre}</div>
                          <div style={D.track}>
                            <div style={{ ...D.fill, background: `linear-gradient(90deg, ${sc}70, ${sc})`, width: `${barPct}%` }} />
                          </div>
                          <div style={{ fontSize: '0.67rem', color: '#8b8b9e', marginTop: '0.25rem' }}>
                            {p.categoria && <span style={{ marginRight: '0.6rem' }}>{p.categoria}</span>}
                            {margenPct !== null && (
                              <>Margen: <strong style={{ color: '#a855f7' }}>{margenPct}%</strong></>
                            )}
                          </div>
                        </div>
                        <div style={D.stats}>
                          <span style={{ fontSize: '1.25rem', fontWeight: '900', color: sc, lineHeight: 1 }}>{stockActual}</span>
                          <span style={{ fontSize: '0.62rem', color: sc, opacity: 0.8 }}>ud. en stock</span>
                          <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#c4c4d4' }}>{formatPeso(p.precio)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── Análisis Pareto ── */}
            {pareto.length > 0 && (
              <motion.div style={D.cardFull} custom={9} initial="hidden" animate="visible" variants={fadeUp}>
                <div style={D.cardHeader}>
                  <div>
                    <h2 style={D.cardTitle}>Análisis Pareto</h2>
                    <p style={D.cardSub}>Productos que concentran el 80% de los ingresos</p>
                  </div>
                </div>
                <div style={D.list}>
                  {pareto.map((p, i) => {
                    const pctAcum    = parseFloat(p.pct_acumulado) || 0;
                    const pctContrib = parseFloat(p.pct_ingresos) || 0;
                    const cat = pctAcum <= 80 ? 'A' : pctAcum <= 95 ? 'B' : 'C';
                    const cc  = cat === 'A' ? '#a855f7' : cat === 'B' ? '#f59e0b' : '#6b7280';
                    const barGrad = cat === 'A'
                      ? 'linear-gradient(90deg, #a855f7, #e879f9)'
                      : cat === 'B'
                      ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                      : 'linear-gradient(90deg, #4b5563, #6b7280)';
                    return (
                      <div key={i} style={D.row}>
                        <div style={{ ...D.badge, background: `${cc}18`, color: cc, fontSize: '0.9rem', fontWeight: '900' }}>{cat}</div>
                        <div style={D.meta}>
                          <div style={D.name}>{p.nombre}</div>
                          <div style={D.track}>
                            <div style={{ ...D.fill, width: `${pctAcum}%`, background: barGrad }} />
                          </div>
                          <div style={{ fontSize: '0.64rem', fontWeight: '600', color: cc, marginTop: '0.25rem' }}>
                            {pctContrib.toFixed(1)}% propio · {pctAcum.toFixed(1)}% acum.
                          </div>
                        </div>
                        <div style={D.stats}>
                          <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#fff', whiteSpace: 'nowrap' }}>{formatPeso(p.ingresos)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── Segmentos RFM ── */}
            {rfm.length > 0 && (
              <motion.div style={D.cardFull} custom={10} initial="hidden" animate="visible" variants={fadeUp}>
                <div style={D.cardHeader}>
                  <div>
                    <h2 style={D.cardTitle}>Segmentos de Clientes (RFM)</h2>
                    <p style={D.cardSub}>Clasificación por recencia, frecuencia y monto</p>
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                    <thead>
                      <tr>
                        {['Nombre', 'Teléfono', 'Recencia (días)', 'Frecuencia', 'Valor monetario', 'Segmento'].map((col) => (
                          <th key={col} style={{
                            padding: '0.5rem 0.75rem',
                            color: '#8b8b9e', fontWeight: '700',
                            textTransform: 'uppercase', letterSpacing: '0.05em',
                            textAlign: 'left', borderBottom: '1px solid #2a2a3a',
                            whiteSpace: 'nowrap', fontSize: '0.6rem',
                          }}>
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rfm.map((c, i) => {
                        const seg = c.segmento ?? '';
                        const sc  = seg === 'VIP' ? '#a855f7' : seg === 'Leal' ? '#10b981' : seg === 'En riesgo' ? '#ef4444' : '#f59e0b';
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #1a1a24' }}>
                            <td style={{ padding: '0.6rem 0.75rem', fontWeight: '700', color: '#fff' }}>{c.nombre ?? '—'}</td>
                            <td style={{ padding: '0.6rem 0.75rem', color: '#8b8b9e' }}>{c.telefono ?? '—'}</td>
                            <td style={{ padding: '0.6rem 0.75rem', color: '#8b8b9e', textAlign: 'center' }}>{c.recencia_dias ?? '—'}</td>
                            <td style={{ padding: '0.6rem 0.75rem', color: '#8b8b9e', textAlign: 'center' }}>{c.frecuencia ?? '—'}</td>
                            <td style={{ padding: '0.6rem 0.75rem', fontWeight: '600', color: '#fff' }}>{formatPeso(c.monto_total)}</td>
                            <td style={{ padding: '0.6rem 0.75rem' }}>
                              <span style={{ background: `${sc}18`, color: sc, fontWeight: '800', fontSize: '0.62rem', textTransform: 'uppercase', borderRadius: '6px', padding: '3px 8px' }}>
                                {seg || '—'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* ── Cross-selling ── */}
            {crossSelling.length > 0 && (
              <motion.div style={D.cardFull} custom={11} initial="hidden" animate="visible" variants={fadeUp}>
                <div style={D.cardHeader}>
                  <div>
                    <h2 style={D.cardTitle}>Cross-Selling</h2>
                    <p style={D.cardSub}>Productos que se compran juntos con frecuencia</p>
                  </div>
                </div>
                <div style={D.list}>
                  {crossSelling.slice(0, 8).map((p, i) => (
                    <div key={i} style={{ ...D.row, gap: '0.75rem' }}>
                      <div style={{ ...D.badge, background: '#10b98118', color: '#10b981' }}>{i + 1}</div>
                      <div style={{ flex: 1, minWidth: 0, fontSize: '0.85rem', fontWeight: '600', color: '#c4c4d4', wordBreak: 'break-word', lineHeight: 1.4 }}>
                        {p.producto_a ?? p.producto1}
                        <span style={{ color: '#a855f7', fontWeight: '900', margin: '0 0.35rem' }}>+</span>
                        {p.producto_b ?? p.producto2}
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#10b981', flexShrink: 0 }}>
                        {p.frecuencia} veces
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Heatmap ── */}
            {heatmap.length > 0 && (
              <motion.div style={D.cardFull} custom={12} initial="hidden" animate="visible" variants={fadeUp}>
                <div style={D.cardHeader}>
                  <div>
                    <h2 style={D.cardTitle}>Actividad por Horario</h2>
                    <p style={D.cardSub}>Pedidos según día y hora</p>
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
                    <thead>
                      <tr>
                        {Object.keys(heatmap[0] ?? {}).map((k) => (
                          <th key={k} style={{
                            padding: '0.4rem 0.6rem',
                            color: '#8b8b9e', fontWeight: '700',
                            textTransform: 'uppercase', letterSpacing: '0.06em',
                            textAlign: 'left', borderBottom: '1px solid #2a2a3a',
                            whiteSpace: 'nowrap', fontSize: '0.6rem',
                          }}>
                            {k}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {heatmap.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #1a1a24' }}>
                          {Object.values(row).map((val, j) => (
                            <td key={j} style={{
                              padding: '0.45rem 0.6rem',
                              color: j === 0 ? '#e2e2f0' : '#8b8b9e',
                              fontWeight: j === 0 ? '700' : '500',
                            }}>
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* ── Estado de Resultados ── */}
            {estadoResultados && (
              <motion.div style={D.cardFull} custom={14} initial="hidden" animate="visible" variants={fadeUp}>
                <div style={D.cardHeader}>
                  <div>
                    <h2 style={D.cardTitle}>Estado de Resultados</h2>
                    <p style={D.cardSub}>Resumen financiero — pedidos activos (excluye cancelados y devueltos)</p>
                  </div>
                  <div style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: '12px', padding: '0.6rem 1.1rem', textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.58rem', color: '#8b8b9e', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>
                      Margen bruto
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#a855f7', lineHeight: 1 }}>
                      {parseFloat(estadoResultados.margen_bruto_pct ?? 0).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
                  {[
                    { label: 'Ventas brutas',    value: formatPeso(estadoResultados.ventas_brutas),         color: '#10b981', icon: '📈', prefix: '' },
                    { label: 'Descuentos',        value: formatPeso(estadoResultados.descuentos_aplicados),  color: '#f59e0b', icon: '🏷️', prefix: '−' },
                    { label: 'Ventas netas',      value: formatPeso(estadoResultados.ventas_netas),          color: '#3b82f6', icon: '💳', prefix: '' },
                    { label: 'Costo de ventas',   value: formatPeso(estadoResultados.costo_de_ventas),       color: '#ef4444', icon: '📦', prefix: '−' },
                    { label: 'Utilidad bruta',    value: formatPeso(estadoResultados.utilidad_bruta),        color: '#a855f7', icon: '✨', prefix: '' },
                  ].map((item) => (
                    <div key={item.label} style={{ background: '#0f0f13', borderRadius: '12px', padding: '1rem 1.1rem', border: `1px solid ${item.color}22` }}>
                      <div style={{ fontSize: '0.6rem', color: '#8b8b9e', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
                        {item.icon}&nbsp;{item.label}
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: '900', color: item.color, wordBreak: 'break-word' }}>
                        {item.prefix && <span style={{ opacity: 0.7, marginRight: '2px' }}>{item.prefix}</span>}
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Top productos ── */}
            {topProductos.length > 0 && (
              <motion.div style={D.cardFull} custom={13} initial="hidden" animate="visible" variants={fadeUp}>
                <div style={D.cardHeader}>
                  <div>
                    <h2 style={D.cardTitle}>Top Productos</h2>
                    <p style={D.cardSub}>Ranking por unidades vendidas este mes</p>
                  </div>
                </div>
                <div style={D.list}>
                  {topProductos.map((p, i) => {
                    const barPct = (parseFloat(p.unidades) / maxUnidades) * 100;
                    const rankColors = ['#f59e0b', '#9ca3af', '#b45309'];
                    const rc = rankColors[i] ?? '#a855f7';
                    return (
                      <div key={i} style={D.row}>
                        <div style={{ ...D.badge, background: `${rc}18`, color: rc }}>{i + 1}</div>
                        <div style={D.meta}>
                          <div style={D.name}>{p.nombre}</div>
                          <div style={D.track}>
                            <div style={{ ...D.fill, width: `${barPct}%` }} />
                          </div>
                        </div>
                        <div style={D.stats}>
                          <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#fff', whiteSpace: 'nowrap' }}>{p.unidades} ud.</span>
                          <span style={{ fontSize: '0.72rem', fontWeight: '600', color: '#a855f7', whiteSpace: 'nowrap' }}>{formatPeso(p.ingresos)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────
const D = {
  layout: {
    display: 'flex',
    background: '#0f0f13',
    minHeight: '100vh',
  },
  main: {
    marginLeft: '240px',
    padding: '2rem 2.5rem',
    flex: 1,
    background: '#0f0f13',
    minHeight: '100vh',
    fontFamily: "'Nunito', system-ui, sans-serif",
  },

  // Header
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: '-0.03em',
    margin: '0 0 0.25rem',
  },
  subtitle: {
    fontSize: '0.78rem',
    color: '#8b8b9e',
    fontWeight: '500',
    textTransform: 'capitalize',
    margin: 0,
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: '#1a1a24',
    border: '1px solid #2a2a3a',
    borderRadius: '12px',
    padding: '0.55rem 1rem',
  },
  searchInput: {
    background: 'transparent',
    border: 'none',
    color: '#ffffff',
    fontSize: '0.85rem',
    fontFamily: 'inherit',
    width: '180px',
  },

  // Grids
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  mainRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 300px',
    gap: '1.5rem',
    marginBottom: '1.5rem',
    alignItems: 'start',
  },
  sideColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },

  // Cards
  card: {
    background: '#1a1a24',
    borderRadius: '16px',
    padding: '1.5rem 1.75rem',
    border: '1px solid #2a2a3a',
    fontFamily: "'Nunito', system-ui, sans-serif",
  },
  cardFull: {
    background: '#1a1a24',
    borderRadius: '16px',
    padding: '1.5rem 1.75rem',
    border: '1px solid #2a2a3a',
    marginBottom: '1.5rem',
    fontFamily: "'Nunito', system-ui, sans-serif",
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '-0.01em',
    margin: '0 0 0.2rem',
  },
  cardSub: {
    fontSize: '0.73rem',
    color: '#8b8b9e',
    fontWeight: '500',
    margin: 0,
  },
  legendChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: 'rgba(168,85,247,0.1)',
    border: '1px solid rgba(168,85,247,0.2)',
    borderRadius: '8px',
    padding: '0.3rem 0.65rem',
  },
  legendDot: {
    width: '7px', height: '7px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #a855f7, #e879f9)',
    flexShrink: 0,
  },

  // Hero card (top #1 product)
  heroCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(168,85,247,0.08)',
    border: '1px solid rgba(168,85,247,0.2)',
    borderRadius: '12px',
    padding: '0.85rem 1rem',
  },
  heroRank: {
    width: '28px', height: '28px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #7c3aed, #c084fc)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '900',
    fontSize: '0.85rem',
    flexShrink: 0,
  },

  // Mini card (indicadores)
  miniCard: {
    background: '#0f0f13',
    borderRadius: '10px',
    padding: '0.7rem 0.9rem',
    border: '1px solid #2a2a3a',
  },

  // List rows
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem 0.9rem',
    background: '#0f0f13',
    borderRadius: '12px',
    border: '1px solid #1e1e2e',
    minWidth: 0,
  },
  badge: {
    width: '32px', height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '900',
    fontSize: '0.82rem',
    flexShrink: 0,
  },
  meta: { flex: 1, minWidth: 0 },
  name: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#e2e2f0',
    marginBottom: '0.35rem',
    wordBreak: 'break-word',
    lineHeight: 1.3,
  },
  track: {
    height: '4px',
    background: '#2a2a3a',
    borderRadius: '50px',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    background: 'linear-gradient(90deg, #a855f7, #e879f9)',
    borderRadius: '50px',
    transition: 'width 0.5s ease',
  },
  stats: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.15rem',
    flexShrink: 0,
    textAlign: 'right',
    maxWidth: '120px',
  },
};
