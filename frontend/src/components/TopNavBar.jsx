import { Shield, Wifi, WifiOff, Zap, Pause, Play } from 'lucide-react';

export default function TopNavBar({
    isLive,
    toggleLive,
    backendStatus,
    avgLatency,
    isPaused,
    togglePause,
    totalTransactions,
}) {
    return (
        <nav
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 24px',
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border-subtle)',
                gap: '16px',
                flexWrap: 'wrap',
            }}
        >
            {/* Left: Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #0891b2 0%, #2563eb 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Shield size={20} color="#fff" strokeWidth={2.5} />
                </div>
                <div>
                    <h1
                        style={{
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            letterSpacing: '-0.01em',
                            lineHeight: 1.2,
                        }}
                    >
                        BlockShield
                    </h1>
                    <span
                        style={{
                            fontSize: '0.65rem',
                            color: 'var(--text-muted)',
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                        }}
                    >
                        Pre-Consensus Fraud Detection
                    </span>
                </div>
            </div>

            {/* Center: Live Status */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    fontSize: '0.78rem',
                }}
            >
                {/* Live Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                        className="animate-pulse-dot"
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: isPaused ? 'var(--amber)' : 'var(--green)',
                        }}
                    />
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {isPaused ? 'Paused' : 'Live Mempool Monitoring'}
                    </span>
                </div>

                {/* Latency */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: 'var(--cyan)',
                    }}
                >
                    <Zap size={13} />
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                        {avgLatency}s
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>avg</span>
                </div>

                {/* Transaction Count */}
                <div style={{ color: 'var(--text-muted)' }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)' }}>
                        {totalTransactions}
                    </span>{' '}
                    txns analyzed
                </div>
            </div>

            {/* Right: Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Backend Status */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        background: backendStatus === 'online' ? 'var(--green-bg)' : 'var(--red-bg)',
                        color: backendStatus === 'online' ? 'var(--green)' : 'var(--red)',
                        border: `1px solid ${backendStatus === 'online' ? 'var(--green-border)' : 'var(--red-border)'}`,
                    }}
                >
                    {backendStatus === 'online' ? <Wifi size={12} /> : <WifiOff size={12} />}
                    API {backendStatus === 'online' ? 'Connected' : 'Offline'}
                </div>

                {/* Pause Button */}
                <button
                    onClick={togglePause}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        background: 'var(--bg-elevated)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-default)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--cyan)';
                        e.currentTarget.style.color = 'var(--cyan)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-default)';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                >
                    {isPaused ? <Play size={12} /> : <Pause size={12} />}
                    {isPaused ? 'Resume' : 'Pause'}
                </button>

                {/* Live/Simulated Toggle */}
                <button
                    onClick={toggleLive}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        background: isLive
                            ? 'linear-gradient(135deg, #0891b2 0%, #2563eb 100%)'
                            : 'var(--bg-elevated)',
                        color: isLive ? '#fff' : 'var(--text-secondary)',
                        border: isLive ? 'none' : '1px solid var(--border-default)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                >
                    {isLive ? 'LIVE' : 'SIMULATED'}
                </button>
            </div>
        </nav>
    );
}
