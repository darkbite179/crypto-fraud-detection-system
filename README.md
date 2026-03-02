# 🛡️ BlockShield — Pre-Consensus Blockchain Fraud Detection

BlockShield is a production-grade, institutional-level monitoring dashboard designed to detect fraudulent blockchain transactions in the mempool **pre-consensus**. Using an ensemble of machine learning models, it analyzes incoming transactions in real-time to prevent fraud before it is finalized on the blockchain.

<img width="1899" height="965" alt="Screenshot 2026-03-02 022445" src="https://github.com/user-attachments/assets/3aba7878-6556-40d3-bdd0-b3a4b7bf68cb" />

## 🚀 Key Features

- **Real-Time Mempool Monitoring**: Live streaming of pending blockchain transactions.
- **AI-Powered Analysis**: Ensemble model (XGBoost + CatBoost + Random Forest) with soft voting for 99.1% detection accuracy.
- **Interactive Network Graph**: Visualizes wallet clusters and transaction links to identify sybil attacks and laundering patterns.
- **Risk Decision Engine**: Intelligent categorization of transactions into **ALLOWED**, **FLAGGED**, or **BLOCKED**.
- **Institutional UI**: Sleek, high-performance dashboard built with React, TailwindCSS v4, and Recharts.
- **Hybrid API Layer**: Seamlessly toggles between live FastAPI backend data and high-fidelity local simulations.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: TailwindCSS v4 (Vanilla CSS variables)
- **Icons**: Lucide React
- **Charts**: Recharts
- **State**: React Hooks (Custom Simulation Engine)

### Backend (Planned/Integrated)
- **Framework**: FastAPI (Python)
- **ML Models**: CatBoost, XGBoost, Scikit-Learn (Random Forest)
- **Data**: Real-time Ethereum/EVM mempool data

## 📦 Project Structure

```text
├── frontend/                # Vite + React Dashboard
│   ├── src/
│   │   ├── components/      # UI Components & Modules
│   │   ├── data/            # Mock Data & Simulation Logic
│   │   ├── hooks/           # Custom React Hooks (useSimulation)
│   │   ├── pages/           # Main Dashboard View
│   │   └── services/        # API Integration Layer
│   └── ...
└── ... (Backend source code)
```

## ⚙️ Setup & Installation

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/darkbite179/crypto-fraud-detection-system-2.git

# Navigate to the frontend directory
cd crypto-fraud-detection-system-2/frontend

# Install dependencies
npm install
```

### 3. Run the Dashboard
```bash
npm run dev
```
The dashboard will be available at `http://localhost:5173`.

## 🛡️ Methodology

BlockShield utilizes a **Soft Voting Ensemble Classifier**. Every transaction entering the mempool is analyzed for over 50 features, including:
- Transaction amount anomalies vs. historical wallet behavior.
- Gas price manipulation patterns.
- Interaction with known high-risk smart contracts.
- Graph-based centrality measures (identifying mixer/tumbler patterns).

---
*Created with ❤️ for the future of secure decentralized finance.*
