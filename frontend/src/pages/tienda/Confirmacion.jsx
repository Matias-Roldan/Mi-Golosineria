import { useLocation, useNavigate } from 'react-router-dom';

export default function Confirmacion() {
  const { state } = useLocation();
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.icon}>✅</div>
        <h2 style={styles.titulo}>¡Pedido recibido!</h2>
        <p style={styles.texto}>
          Gracias <strong>{state?.nombre}</strong>, tu pedido <strong>#{state?.pedido_id}</strong> fue registrado correctamente.
        </p>
        <p style={styles.subtexto}>
          Nos pondremos en contacto por WhatsApp para coordinar la entrega.
        </p>
        <button style={styles.btn} onClick={() => navigate('/')}>
          Volver a la tienda
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  card: { background: 'white', borderRadius: '16px', padding: '3rem 2rem', textAlign: 'center', maxWidth: '440px', width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
  icon: { fontSize: '4rem', marginBottom: '1rem' },
  titulo: { fontSize: '1.8rem', fontWeight: '800', color: '#1f2937', marginBottom: '0.75rem' },
  texto: { fontSize: '1rem', color: '#374151', marginBottom: '0.5rem' },
  subtexto: { fontSize: '0.9rem', color: '#6b7280', marginBottom: '2rem' },
  btn: { background: '#7c3aed', color: 'white', border: 'none', padding: '0.85rem 2rem', borderRadius: '9px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer' },
};