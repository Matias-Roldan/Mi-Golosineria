import { AreaChart, Area, ResponsiveContainer } from 'recharts';

export default function StatsCard({ icon, label, value, color = '#a855f7', sparkData }) {
  const isLongText = typeof value === 'string' && value.length > 15;
  const gradId = `sg-${label.toLowerCase().replace(/\W/g, '')}`;

  return (
    <div style={S.card}>
      <div style={S.top}>
        <div style={{ ...S.iconBadge, background: `${color}1a`, border: `1px solid ${color}30` }}>
          <span style={S.icon}>{icon}</span>
        </div>
        <div style={S.body}>
          <p style={S.label}>{label}</p>
          <p style={{ ...S.value, ...(isLongText ? S.valueSmall : {}) }}>{value ?? '—'}</p>
        </div>
      </div>

      {sparkData && sparkData.length > 1 && (
        <div style={S.sparkWrap}>
          <ResponsiveContainer width="100%" height={44}>
            <AreaChart data={sparkData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={color} stopOpacity={0.28} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={color}
                strokeWidth={1.8}
                fill={`url(#${gradId})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

const S = {
  card: {
    background: '#1a1a24',
    borderRadius: '16px',
    padding: '1.25rem 1.4rem 0',
    border: '1px solid #2a2a3a',
    fontFamily: "'Nunito', system-ui, sans-serif",
    overflow: 'hidden',
  },
  top: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    paddingBottom: '0.9rem',
  },
  iconBadge: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: { fontSize: '1.3rem', lineHeight: 1 },
  body: { flex: 1, minWidth: 0 },
  label: {
    fontSize: '0.64rem',
    fontWeight: '700',
    color: '#8b8b9e',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    margin: '0 0 0.3rem',
  },
  value: {
    fontSize: '1.55rem',
    fontWeight: '900',
    letterSpacing: '-0.03em',
    lineHeight: 1.1,
    color: '#ffffff',
    wordBreak: 'break-word',
    overflowWrap: 'anywhere',
    margin: 0,
  },
  valueSmall: {
    fontSize: '0.95rem',
    lineHeight: 1.3,
  },
  sparkWrap: {
    marginLeft: '-1.4rem',
    marginRight: '-1.4rem',
  },
};
