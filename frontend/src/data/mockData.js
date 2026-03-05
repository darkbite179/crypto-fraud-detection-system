// ========== WALLET ADDRESSES ==========
const WALLETS = [
    '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD38',
    '0x53d284357ec70cE289D6D64134DfAc8E511c8a3D',
    '0xFe89cc7aBb2C4183683ab71653C4cdc9B02D44b7',
    '0x1B3cB81E51011b549d78bf720b0d924ac763A7C2',
    '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8',
    '0x8484Ef722627bf18ca5Ae6BcF031c23E6e922B30',
    '0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf',
    '0x0548F59fEE79f8832C299e01dCA5c76F034F558e',
    '0x6cC5F688a315f3dC28A7781717a9A798a59fDA7b',
    '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B',
    '0x28C6c06298d514Db089934071355E5743bf21d60',
    '0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549',
    '0xDFd5293D8e347dFe59E90eFd55b2956a1343963d',
    '0x56Eddb7aa87536c09CCc2793473599fD21A8b17F',
    '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE',
];

// ========== HELPERS ==========
function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function shortHash() {
    return '0x' + Array.from({ length: 64 }, () =>
        '0123456789abcdef'[Math.floor(Math.random() * 16)]
    ).join('');
}

function shortAddr(addr) {
    return addr.slice(0, 6) + '...' + addr.slice(-4);
}

// ========== TRANSACTION GENERATOR ==========
let txCounter = 0;

export function generateTransaction() {
    txCounter++;
    const sender = randomItem(WALLETS);
    let receiver = randomItem(WALLETS);
    while (receiver === sender) receiver = randomItem(WALLETS);

    const amount = Math.random() < 0.15
        ? randomBetween(50, 500)     // large — suspicious
        : randomBetween(0.001, 10);  // normal

    // Backend-required fields
    const velocity_10min = Math.random() < 0.1 ? Math.floor(randomBetween(5, 12)) : Math.floor(randomBetween(0, 4));
    const is_new_device = Math.random() < 0.15;
    const is_new_location = Math.random() < 0.12;
    const user_avg_amount = parseFloat(randomBetween(1, 50).toFixed(2));

    const riskScore = calculateRisk(amount, sender);

    const decision = riskScore > 0.85
        ? 'BLOCKED'
        : riskScore > 0.6
            ? 'FLAGGED'
            : 'ALLOWED';

    return {
        id: txCounter,
        tx_hash: shortHash(),
        sender,
        senderShort: shortAddr(sender),
        receiver,
        receiverShort: shortAddr(receiver),
        amount: parseFloat(amount.toFixed(4)),
        time: txCounter,
        timestamp: Date.now(),
        velocity_10min,
        is_new_device,
        is_new_location,
        user_avg_amount,
        riskScore: parseFloat(riskScore.toFixed(3)),
        decision,
        latency: parseFloat(randomBetween(0.05, 0.12).toFixed(3)),
        model_votes: {
            random_forest: parseFloat((riskScore + randomBetween(-0.08, 0.08)).toFixed(3)),
            xgboost: parseFloat((riskScore + randomBetween(-0.06, 0.06)).toFixed(3)),
            catboost: parseFloat((riskScore + randomBetween(-0.05, 0.05)).toFixed(3)),
        },
    };
}

function calculateRisk(amount, sender) {
    let risk = 0;

    // Amount anomaly
    if (amount > 100) risk += 0.35;
    else if (amount > 50) risk += 0.2;
    else if (amount > 10) risk += 0.08;
    else risk += 0.02;

    // Randomized behavioral signal (simulates wallet history)
    risk += randomBetween(0, 0.45);

    // Time anomaly (simulate unusual hours)
    const hour = new Date().getHours();
    if (hour >= 1 && hour <= 5) risk += 0.15;

    return Math.min(Math.max(risk, 0.01), 0.99);
}

// ========== INITIAL SEED DATA ==========
export function generateInitialTransactions(count = 15) {
    return Array.from({ length: count }, () => generateTransaction()).reverse();
}

// ========== GRAPH DATA ==========
export function buildGraphData(transactions) {
    const nodeMap = new Map();
    const edges = [];

    transactions.forEach((tx) => {
        if (!nodeMap.has(tx.sender)) {
            nodeMap.set(tx.sender, {
                id: tx.sender,
                label: shortAddr(tx.sender),
                risk: 0,
                txCount: 0,
            });
        }
        if (!nodeMap.has(tx.receiver)) {
            nodeMap.set(tx.receiver, {
                id: tx.receiver,
                label: shortAddr(tx.receiver),
                risk: 0,
                txCount: 0,
            });
        }

        const senderNode = nodeMap.get(tx.sender);
        senderNode.txCount++;
        senderNode.risk = Math.max(senderNode.risk, tx.riskScore);

        const receiverNode = nodeMap.get(tx.receiver);
        receiverNode.txCount++;

        edges.push({
            source: tx.sender,
            target: tx.receiver,
            risk: tx.riskScore,
        });
    });

    return {
        nodes: Array.from(nodeMap.values()),
        edges,
    };
}

// ========== MODEL METRICS ==========
export const MODEL_METRICS = {
    accuracy: 99.10,
    precision: 98.5,
    recall: 98.8,
    f1Score: 98.6,
    falsePositiveRate: 4.3,
    avgDetectionTime: 0.08,
};

export const ENSEMBLE_MODELS = [
    { name: 'CatBoost', accuracy: 99.57, color: '#0891b2' },
    { name: 'XGBoost', accuracy: 98.57, color: '#2563eb' },
    { name: 'Random Forest', accuracy: 98.47, color: '#059669' },
];
