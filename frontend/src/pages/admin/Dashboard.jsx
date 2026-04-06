import { useEffect, useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import StatsCard from '../../components/admin/StatsCard';
import { getKpis } from '../../api/adminApi';

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getKpis()
      .then(({ data }) => setKpis(data))
      .finally(() => setLoading(false));
  }, []);

  const formatPeso = (n) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);

  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>
        <h1 style={styles.title}>📊 Dashboard</h1>
        <p style={styles.subtitle}>Resumen del mes actual</p>

        {loading ? (
          <p>Cargando KPIs...</p>
        ) : (
          <div style={styles.grid}>
            <StatsCard icon="💰" label="Ventas del mes" value={formatPeso(kpis?.total_ventas_mes)} color="#10b981" />
            <StatsCard icon="🛒" label="Pedidos del mes" value={kpis?.cantidad_pedidos_mes} color="#7c3aed" />
            <StatsCard icon="🎯" label="Ticket promedio" value={formatPeso(kpis?.ticket_promedio)} color="#f59e0b" />
            <StatsCard icon="👥" label="Clientes únicos" value={kpis?.clientes_unicos} color="#3b82f6" />
            <StatsCard icon="🏆" label="Producto más vendido" value={kpis?.producto_mas_vendido} color="#ef4444" />
            <StatsCard icon="💵" label="Mayor ingreso" value={kpis?.producto_mas_ingresos} color="#06b6d4" />
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  layout: { display: 'flex' },
  main: { marginLeft: '240px', padding: '2rem', flex: 1, background: '#f3f4f6', minHeight: '100vh' },
  title: { fontSize: '1.75rem', color: '#1f2937', marginBottom: '0.25rem' },
  subtitle: { color: '#6b7280', marginBottom: '2rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' },
};