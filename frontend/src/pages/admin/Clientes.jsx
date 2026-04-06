import { useEffect, useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import { getClientes, getPerfilCliente } from '../../api/clientesApi';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [clienteSel, setClienteSel] = useState(null);

  useEffect(() => { getClientes().then(({ data }) => setClientes(data)); }, []);

  const verPerfil = async (cliente) => {
    const { data } = await getPerfilCliente(cliente.id);
    setPerfil(data);
    setClienteSel(cliente);
  };

  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>
        <h1 style={styles.title}>👥 Clientes</h1>
        <div style={styles.content}>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th>Nombre</th><th>Teléfono</th><th>Pedidos</th><th>Total gastado</th><th>Último pedido</th><th>Ver</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={c.id} style={styles.tr}>
                    <td style={styles.td}>{c.nombre}</td>
                    <td style={styles.td}>{c.telefono}</td>
                    <td style={styles.td}>{c.cantidad_pedidos}</td>
                    <td style={styles.td}>${c.total_gastado}</td>
                    <td style={styles.td}>{c.ultimo_pedido ? new Date(c.ultimo_pedido).toLocaleDateString('es-AR') : '—'}</td>
                    <td style={styles.td}>
                      <button style={styles.btnSmall} onClick={() => verPerfil(c)}>🔍</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {clienteSel && (
            <div style={styles.detalle}>
              <h3>{clienteSel.nombre}</h3>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>📞 {clienteSel.telefono}</p>
              <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Historial de pedidos</h4>
              {perfil?.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Sin pedidos aún</p>
              ) : (
                perfil?.map((p) => (
                  <div key={p.id} style={styles.pedidoRow}>
                    <span>#{p.id} — ${p.total}</span>
                    <span style={{ color: '#7c3aed', fontSize: '0.8rem' }}>{p.estado}</span>
                  </div>
                ))
              )}
              <button style={styles.btnCerrar} onClick={() => { setPerfil(null); setClienteSel(null); }}>Cerrar</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  layout: { display: 'flex' },
  main: { marginLeft: '240px', padding: '2rem', flex: 1, background: '#f3f4f6', minHeight: '100vh' },
  title: { fontSize: '1.75rem', color: '#1f2937', marginBottom: '1.5rem' },
  content: { display: 'flex', gap: '1.5rem', alignItems: 'flex-start' },
  tableWrapper: { flex: 1, background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f9fafb', fontWeight: '600', color: '#374151', fontSize: '0.85rem' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '0.85rem 1rem', fontSize: '0.9rem', color: '#374151' },
  btnSmall: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' },
  detalle: { width: '280px', background: 'white', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  pedidoRow: { display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.9rem' },
  btnCerrar: { marginTop: '1rem', background: '#e5e7eb', border: 'none', padding: '0.5rem 1rem', borderRadius: '7px', cursor: 'pointer', width: '100%' },
};