export default function StatsCard({ icon, label, value, color = '#7c3aed' }) {
  return (
    <div style={S.card}>
      <div style={{ ...S.iconBadge, background: `${color}18`, border: `1.5px solid ${color}28` }}>
        <span style={S.icon}>{icon}</span>
      </div>
      <div style={S.body}>
        <p style={S.label}>{label}</p>
        <p style={{ ...S.value, color }}>{value ?? '—'}</p>
      </div>
    </div>
  );
}

const S = {
  card: {
    background: 'white',
    borderRadius: '18px',
    padding: '1.4rem 1.5rem',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    border: '1px solid #ede9fe',
    boxShadow: '0 1px 6px rgba(109,40,217,0.06)',
    fontFamily: "'Nunito', system-ui, sans-serif",
  },
  iconBadge: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: { fontSize: '1.5rem', lineHeight: 1 },
  body: { flex: 1, minWidth: 0 },
  label: {
    fontSize: '0.68rem',
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '0.3rem',
    margin: '0 0 0.3rem',
  },
  value: {
    fontSize: '1.55rem',
    fontWeight: '900',
    letterSpacing: '-0.03em',
    lineHeight: 1.1,
    fontFamily: 'Georgia, serif',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    margin: 0,
  },
};
