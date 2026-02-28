export default function RiskBar({ score }) {
    const percentage = Math.round(score * 100);

    const getColor = (s) => {
        if (s > 0.85) return 'var(--red)';
        if (s > 0.6) return 'var(--amber)';
        return 'var(--green)';
    };

    const color = getColor(score);

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
                style={{
                    width: 60,
                    height: 5,
                    borderRadius: 3,
                    background: 'var(--bg-elevated)',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        width: `${percentage}%`,
                        height: '100%',
                        borderRadius: 3,
                        background: color,
                        transition: 'width 0.3s ease',
                    }}
                />
            </div>
            <span
                style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color,
                    fontFamily: "'JetBrains Mono', monospace",
                    minWidth: 36,
                }}
            >
                {percentage}%
            </span>
        </div>
    );
}
