import { Activity } from 'lucide-react';
import Badge from './ui/Badge';
import RiskBar from './ui/RiskBar';

export default function IncomingTransactions({ transactions }) {
    return (
        <div className="card" style={{ height: '420px', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
                <Activity />
                <span>Incoming Transactions</span>
                <span
                    style={{
                        marginLeft: 'auto',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.7rem',
                        color: 'var(--cyan)',
                    }}
                >
                    {transactions.length} txns
                </span>
            </div>

            <div style={{ flex: 1, overflow: 'auto' }}>
                <table className="tx-table">
                    <thead>
                        <tr>
                            <th>Tx Hash</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Amount (ETH)</th>
                            <th>Risk</th>
                            <th>Decision</th>
                            <th>Latency</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx, index) => (
                            <tr key={tx.id} className={index === 0 ? 'new-row' : ''}>
                                <td>
                                    <span
                                        className="font-mono"
                                        style={{
                                            fontSize: '0.75rem',
                                            color: 'var(--cyan)',
                                            opacity: 0.85,
                                        }}
                                    >
                                        {tx.tx_hash.slice(0, 10)}...
                                    </span>
                                </td>
                                <td>
                                    <span className="font-mono" style={{ fontSize: '0.78rem' }}>
                                        {tx.senderShort}
                                    </span>
                                </td>
                                <td>
                                    <span className="font-mono" style={{ fontSize: '0.78rem' }}>
                                        {tx.receiverShort}
                                    </span>
                                </td>
                                <td>
                                    <span
                                        className="font-mono"
                                        style={{
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            color: tx.amount > 50 ? 'var(--amber)' : 'var(--text-primary)',
                                        }}
                                    >
                                        {tx.amount.toFixed(4)}
                                    </span>
                                </td>
                                <td>
                                    <RiskBar score={tx.riskScore} />
                                </td>
                                <td>
                                    <Badge variant={tx.decision} />
                                </td>
                                <td>
                                    <span
                                        className="font-mono"
                                        style={{
                                            fontSize: '0.72rem',
                                            color: tx.latency > 0.1 ? 'var(--amber)' : 'var(--text-muted)',
                                        }}
                                    >
                                        {tx.latency}s
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
