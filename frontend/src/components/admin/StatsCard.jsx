export default function StatsCard({ icon, label, value, color = '#7c3aed' }) {
  return (
    <div style={{ ...styles.card, borderTop: `4px solid ${color}` }}>
      <span style={styles.icon}>{icon}</span>
      <div>
        <p style={styles.label}>{label}</p>
        <p style={styles.value}>{value ?? '—'}</p>
      </div>
    </div>
  );
}

const styles = {
  card: { background: 'white', borderRadius: '10px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  icon: { fontSize: '2rem' },
  label: { color: '#6b7280', fontSize: '0.8rem', marginBottom: '0.25rem' },
  value: { fontSize: '1.4rem', fontWeight: '700', color: '#1f2937' },
};