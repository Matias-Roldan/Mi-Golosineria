import { useLocation, useNavigate } from 'react-router-dom';

export default function Confirmacion() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const numero = '5491122566117';

  const mensaje = encodeURIComponent(
    `Hola! Soy *${state?.nombre}* y acabo de hacer el pedido *#${state?.pedido_id}* desde la tienda online. ¡Quedo a la espera de confirmación! 🍬`
  );

  const urlWhatsApp = `https://wa.me/${numero}?text=${mensaje}`;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.icon}>✅</div>
        <h2 style={styles.titulo}>¡Pedido recibido!</h2>
        <p style={styles.texto}>
          Gracias <strong>{state?.nombre}</strong>, tu pedido <strong>#{state?.pedido_id}</strong> fue registrado correctamente.
        </p>
        <p style={styles.subtexto}>
          Hacé click en el botón para avisarnos por WhatsApp y coordinar la entrega.
        </p>

        <a href={urlWhatsApp} target="_blank" rel="noopener noreferrer" style={styles.btnWhatsapp}>
          💬 Avisar por WhatsApp
        </a>

        <button style={styles.btnVolver} onClick={() => navigate('/')}>
          Volver a la tienda
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  card: { background: 'white', borderRadius: '16px', padding: '3rem 2rem', textAlign: 'center', maxWidth: '440px', width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  icon: { fontSize: '4rem' },
  titulo: { fontSize: '1.8rem', fontWeight: '800', color: '#1f2937' },
  texto: { fontSize: '1rem', color: '#374151' },
  subtexto: { fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem' },
  btnWhatsapp: { display: 'block', background: '#25d366', color: 'white', padding: '0.9rem', borderRadius: '10px', fontSize: '1rem', fontWeight: '700', textDecoration: 'none', cursor: 'pointer' },
  btnVolver: { background: '#e5e7eb', color: '#374151', border: 'none', padding: '0.75rem', borderRadius: '10px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer' },
};