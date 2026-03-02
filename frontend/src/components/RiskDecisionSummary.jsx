import { ShieldOff, AlertTriangle, ShieldCheck } from 'lucide-react';
import Sparkline from './ui/Sparkline';

export default function RiskDecisionSummary({ riskSummary, sparkHistory }) {
    const total = riskSummary.total || 1;
    const cards = [
        {
            key: 'BLOCKED',
            label: 'Blocked',
            count: riskSummary.BLOCKED,
            pct: ((riskSummary.BLOCKED / total) * 100).toFixed(1),
            color: 'var(--red)',
            bg: 'var(--red-bg)',
            border: 'var(--red-border)',
            icon: ShieldOff,
            sparkData: sparkHistory.blocked,
        },
        {
            key: 'FLAGGED',
            label: 'Flagged',
            count: riskSummary.FLAGGED,
            pct: ((riskSummary.FLAGGED / total) * 100).toFixed(1),
            color: 'var(--amber)',
            bg: 'var(--amber-bg)',
            border: 'var(--amber-border)',
            icon: AlertTriangle,
            sparkData: sparkHistory.flagged,
        },
        {
            key: 'ALLOWED',
            label: 'Allowed',
            count: riskSummary.ALLOWED,
            pct: ((riskSummary.ALLOWED / total) * 100).toFixed(1),
            color: 'var(--green)',
            bg: 'var(--green-bg)',
            border: 'var(--green-border)',
            icon: ShieldCheck,
            sparkData: sparkHistory.allowed,
        },
    ];

    return (
        <div className="card">
            <div className="card-header">
                <ShieldOff />
                <span>Risk Decisions</span>
            </div>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-sm)',
                }}
            >
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.key}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-md)',
                                padding: '12px 16px',
                                borderRadius: 'var(--radius-md)',
                                background: card.bg,
                                border: `1px solid ${card.border}`,
                            }}
                        >
                            <Icon size={20} color={card.color} />

                            <div style={{ flex: 1 }}>
                                <div
                                    style={{
                                        fontSize: '0.72rem',
                                        color: 'var(--text-muted)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        fontWeight: 600,
                                    }}
                                >
                                    {card.label}
                                </div>
                                <div
                                    style={{
                                        fontSize: '1.5rem',
                                        fontWeight: 700,
                                        color: card.color,
                                        lineHeight: 1.2,
                                    }}
                                >
                                    {card.count}
                                    <span
                                        style={{
                                            fontSize: '0.8rem',
                                            fontWeight: 500,
                                            color: 'var(--text-muted)',
                                            marginLeft: 6,
                                        }}
                                    >
                                        ({card.pct}%)
                                    </span>
                                </div>
                            </div>

                            <div style={{ width: 80 }}>
                                <Sparkline data={card.sparkData} color={card.color} height={32} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
