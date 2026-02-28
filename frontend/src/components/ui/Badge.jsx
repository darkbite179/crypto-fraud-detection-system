const VARIANTS = {
    BLOCKED: {
        bg: 'var(--red-bg)',
        border: 'var(--red-border)',
        color: 'var(--red)',
        label: 'BLOCKED',
    },
    FLAGGED: {
        bg: 'var(--amber-bg)',
        border: 'var(--amber-border)',
        color: 'var(--amber)',
        label: 'FLAGGED',
    },
    ALLOWED: {
        bg: 'var(--green-bg)',
        border: 'var(--green-border)',
        color: 'var(--green)',
        label: 'ALLOWED',
    },
};

export default function Badge({ variant }) {
    const style = VARIANTS[variant] || VARIANTS.ALLOWED;

    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
                background: style.bg,
                border: `1px solid ${style.border}`,
                color: style.color,
            }}
        >
            <span
                style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: style.color,
                }}
            />
            {style.label}
        </span>
    );
}
