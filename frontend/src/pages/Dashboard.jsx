import TopNavBar from '../components/TopNavBar';
import IncomingTransactions from '../components/IncomingTransactions';
import NetworkGraph from '../components/NetworkGraph';
import RiskDecisionSummary from '../components/RiskDecisionSummary';
import ModelPerformance from '../components/ModelPerformance';
import { useSimulation } from '../hooks/useSimulation';

export default function Dashboard() {
    const {
        transactions,
        riskSummary,
        avgLatency,
        graphData,
        sparkHistory,
        modelMetrics,
        isLive,
        toggleLive,
        backendStatus,
        isPaused,
        togglePause,
    } = useSimulation();

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <TopNavBar
                isLive={isLive}
                toggleLive={toggleLive}
                backendStatus={backendStatus}
                avgLatency={avgLatency}
                isPaused={isPaused}
                togglePause={togglePause}
                totalTransactions={transactions.length}
            />

            <div className="dashboard-grid" style={{ flex: 1 }}>
                {/* Row 2: Transactions + Network Graph */}
                <div className="col-span-7">
                    <IncomingTransactions transactions={transactions} />
                </div>
                <div className="col-span-5">
                    <NetworkGraph graphData={graphData} />
                </div>

                {/* Row 3: Risk Summary + Model Performance */}
                <div className="col-span-5">
                    <RiskDecisionSummary riskSummary={riskSummary} sparkHistory={sparkHistory} />
                </div>
                <div className="col-span-7">
                    <ModelPerformance metrics={modelMetrics} />
                </div>
            </div>

            {/* Footer */}
            <footer
                style={{
                    padding: '10px 24px',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.68rem',
                    color: 'var(--text-muted)',
                }}
            >
                <span>BlockShield v1.0 — Pre-Consensus Fraud Detection Engine</span>
                <span>
                    Ensemble: CatBoost + XGBoost + Random Forest · Soft Voting ·{' '}
                    <span
                        className="font-mono"
                        style={{ color: 'var(--cyan)' }}
                    >
                        99.10%
                    </span>{' '}
                    accuracy
                </span>
            </footer>
        </div>
    );
}
