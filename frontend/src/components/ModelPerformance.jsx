import { Cpu, Target, BarChart3, Award, AlertCircle, Timer } from 'lucide-react';
import StatCard from './ui/StatCard';
import { ENSEMBLE_MODELS } from '../data/mockData';

export default function ModelPerformance({ metrics }) {
    const stats = [
        {
            icon: Target,
            label: 'Accuracy',
            value: `${metrics.accuracy}%`,
            subtitle: 'Ensemble (Soft Voting)',
            color: '#0891b2',
        },
        {
            icon: Cpu,
            label: 'Precision',
            value: `${metrics.precision}%`,
            subtitle: 'True positive ratio',
            color: '#2563eb',
        },
        {
            icon: BarChart3,
            label: 'Recall',
            value: `${metrics.recall}%`,
            subtitle: 'Fraud detection rate',
            color: '#059669',
        },
        {
            icon: Award,
            label: 'F1 Score',
            value: `${metrics.f1Score}%`,
            subtitle: 'Harmonic mean',
            color: '#7c3aed',
        },
        {
            icon: AlertCircle,
            label: 'False Positive Rate',
            value: `${metrics.falsePositiveRate}%`,
            subtitle: 'Legitimate blocked',
            color: '#d97706',
        },
        {
            icon: Timer,
            label: 'Detection Time',
            value: `${metrics.avgDetectionTime}s`,
            subtitle: 'Per transaction',
            color: '#db2777',
        },
    ];

    return (
        <div className="card">
            <div className="card-header">
                <Cpu />
                <span>Model Performance</span>
            </div>

            {/* Stat Grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 'var(--space-sm)',
                    marginBottom: 'var(--space-md)',
                }}
            >
                {stats.map((s) => (
                    <StatCard key={s.label} {...s} />
                ))}
            </div>

            {/* Ensemble Model Breakdown */}
            <div
                style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                }}
            >
                <div
                    style={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        marginBottom: 10,
                    }}
                >
                    Ensemble Breakdown
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                    {ENSEMBLE_MODELS.map((model) => (
                        <div key={model.name} style={{ flex: 1 }}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: 4,
                                }}
                            >
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    {model.name}
                                </span>
                                <span
                                    className="font-mono"
                                    style={{
                                        fontSize: '0.72rem',
                                        fontWeight: 600,
                                        color: model.color,
                                    }}
                                >
                                    {model.accuracy}%
                                </span>
                            </div>
                            <div
                                style={{
                                    height: 4,
                                    borderRadius: 2,
                                    background: 'var(--bg-elevated)',
                                    overflow: 'hidden',
                                }}
                            >
                                <div
                                    style={{
                                        width: `${model.accuracy}%`,
                                        height: '100%',
                                        borderRadius: 2,
                                        background: model.color,
                                        transition: 'width 0.5s ease',
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
