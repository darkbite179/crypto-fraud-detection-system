export default function StatCard({ icon: Icon, label, value, subtitle, trend, color }) {
    return (
        <div
            style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                transition: 'border-color 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {Icon && (
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: '8px',
                            background: `${color || 'var(--cyan)'}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Icon size={16} color={color || 'var(--cyan)'} />
                    </div>
                )}
                <span
                    style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                    }}
                >
                    {label}
                </span>
            </div>
            <div
                style={{
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: color || 'var(--text-primary)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                }}
            >
                {value}
            </div>
            {subtitle && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {subtitle}
                </span>
            )}
            {trend && (
                <span
                    style={{
                        fontSize: '0.72rem',
                        color: trend > 0 ? 'var(--green)' : 'var(--red)',
                        fontWeight: 500,
                    }}
                >
                    {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                </span>
            )}
        </div>
    );
}
