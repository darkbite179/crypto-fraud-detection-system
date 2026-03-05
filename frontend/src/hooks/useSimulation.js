import { useState, useEffect, useCallback, useRef } from 'react';
import { generateTransaction, generateInitialTransactions, buildGraphData, MODEL_METRICS } from '../data/mockData';
import { analyzeTransaction, getHealth } from '../services/api';

const MAX_TRANSACTIONS = 50;

export function useSimulation() {
    const [transactions, setTransactions] = useState(() => generateInitialTransactions(15));
    const [isLive, setIsLive] = useState(false);
    const [backendStatus, setBackendStatus] = useState('checking');
    const [isPaused, setIsPaused] = useState(false);
    const intervalRef = useRef(null);

    // Check backend health
    useEffect(() => {
        async function check() {
            const health = await getHealth();
            setBackendStatus(health.status === 'offline' ? 'offline' : 'online');
        }
        check();
        const id = setInterval(check, 10000);
        return () => clearInterval(id);
    }, []);

    // Add a new transaction (mock or live)
    const addTransaction = useCallback(async () => {
        const mockTx = generateTransaction();

        if (isLive && backendStatus === 'online') {
            // Send only the fields the backend expects
            const response = await analyzeTransaction({
                amount: mockTx.amount,
                time: mockTx.time,
                sender: mockTx.sender,
                receiver: mockTx.receiver,
                velocity_10min: mockTx.velocity_10min,
                is_new_device: mockTx.is_new_device,
                is_new_location: mockTx.is_new_location,
                user_avg_amount: mockTx.user_avg_amount,
            });

            if (response) {
                // Map backend response to frontend format
                const decisionMap = { 'Block': 'BLOCKED', 'Flag': 'FLAGGED', 'Allow': 'ALLOWED' };
                mockTx.decision = decisionMap[response.final_decision] || mockTx.decision;

                if (response.final_fraud_probability != null) {
                    mockTx.riskScore = response.final_fraud_probability;
                }
                if (response.latency_sec != null) {
                    mockTx.latency = response.latency_sec;
                }
                if (response.reason) {
                    mockTx.reason = response.reason;
                }
                if (response.risk_level) {
                    mockTx.riskLevel = response.risk_level;
                }
                // Store raw engine results for potential future use
                if (response.engines) {
                    mockTx.engines = response.engines;
                }
            }
        }

        setTransactions((prev) => {
            const updated = [mockTx, ...prev];
            return updated.slice(0, MAX_TRANSACTIONS);
        });
    }, [isLive, backendStatus]);

    // Simulation interval
    useEffect(() => {
        if (isPaused) return;
        intervalRef.current = setInterval(addTransaction, 2500);
        return () => clearInterval(intervalRef.current);
    }, [addTransaction, isPaused]);

    // Risk summary
    const riskSummary = transactions.reduce(
        (acc, tx) => {
            acc[tx.decision] = (acc[tx.decision] || 0) + 1;
            acc.total++;
            return acc;
        },
        { BLOCKED: 0, FLAGGED: 0, ALLOWED: 0, total: 0 }
    );

    // Average latency
    const avgLatency = transactions.length > 0
        ? (transactions.reduce((sum, tx) => sum + tx.latency, 0) / transactions.length).toFixed(3)
        : '0.000';

    // Graph data (last 30 transactions for performance)
    const graphData = buildGraphData(transactions.slice(0, 30));

    // Sparkline history
    const [sparkHistory, setSparkHistory] = useState({
        blocked: [0, 0, 0, 0, 0, 0, 0, 0],
        flagged: [0, 0, 0, 0, 0, 0, 0, 0],
        allowed: [0, 0, 0, 0, 0, 0, 0, 0],
    });

    useEffect(() => {
        const id = setInterval(() => {
            setSparkHistory((prev) => ({
                blocked: [...prev.blocked.slice(1), riskSummary.BLOCKED],
                flagged: [...prev.flagged.slice(1), riskSummary.FLAGGED],
                allowed: [...prev.allowed.slice(1), riskSummary.ALLOWED],
            }));
        }, 5000);
        return () => clearInterval(id);
    }, [riskSummary.BLOCKED, riskSummary.FLAGGED, riskSummary.ALLOWED]);

    return {
        transactions,
        riskSummary,
        avgLatency,
        graphData,
        sparkHistory,
        modelMetrics: MODEL_METRICS,
        isLive,
        toggleLive: () => setIsLive((prev) => !prev),
        backendStatus,
        isPaused,
        togglePause: () => setIsPaused((prev) => !prev),
    };
}
