import os
import time
import logging

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Security
from fastapi.security import APIKeyHeader
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from ml_engine.predictor import classify_transaction as ml_classify
from rule_based_detector import predict_transaction as rule_predict

# ─────────────────────────────────────────────
# Environment & Logging
# ─────────────────────────────────────────────

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
# API Security
# ─────────────────────────────────────────────

API_KEY = os.getenv("API_KEY", "supersecret123")
api_key_header = APIKeyHeader(name="X-API-KEY")

# ─────────────────────────────────────────────
# FastAPI App
# ─────────────────────────────────────────────

app = FastAPI(
    title="BlockShield — Fraud Detection API",
    description=(
        "Real-time pre-consensus blockchain fraud detection system. "
        "Analyses incoming transactions using ML + Graph Intelligence "
        "and classifies them as **Allowed**, **Flagged**, or **Blocked**."
    ),
    version="1.0.0",
)

# ─────────────────────────────────────────────
# Request Model
# ─────────────────────────────────────────────

class TransactionRequest(BaseModel):
    """Incoming transaction payload for fraud analysis."""

    amount: float = Field(..., gt=0, description="Transaction amount in USD")
    time: int = Field(..., description="Time-step identifier")
    sender: str = Field(..., description="Sender wallet address")
    receiver: str = Field(..., description="Receiver wallet address")
    velocity_10min: int = Field(0, ge=0, description="Number of transactions by sender in last 10 minutes")
    is_new_device: bool = Field(False, description="Whether the sender is using a previously unseen device")
    is_new_location: bool = Field(False, description="Whether the sender is transacting from a new location")
    user_avg_amount: Optional[float] = Field(None, ge=0, description="Historical average transaction amount for the sender")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "amount": 1500.0,
                    "time": 1,
                    "sender": "bc1q_alice_wallet",
                    "receiver": "bc1q_coffee_shop",
                    "velocity_10min": 1,
                    "is_new_device": False,
                    "is_new_location": False,
                    "user_avg_amount": 1200.0,
                }
            ]
        }
    }


# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────

def _compute_risk_level(probability: float) -> str:
    if probability >= 0.7:
        return "High"
    elif probability >= 0.3:
        return "Moderate"
    return "Low"


def _generate_reason(probability: float, tx_data: dict) -> str:
    reasons: list[str] = []

    if probability >= 0.7:
        reasons.append("High fraud probability detected")
    elif probability >= 0.3:
        reasons.append("Moderate fraud indicators detected")
    else:
        reasons.append("Transaction within normal parameters")

    if tx_data.get("is_new_device"):
        reasons.append("New device detected")
    if tx_data.get("is_new_location"):
        reasons.append("New location detected")

    avg = tx_data.get("user_avg_amount")
    amount = tx_data.get("amount", 0)
    if avg and avg > 0 and amount / avg > 3:
        reasons.append(f"Amount {amount / avg:.1f}x above user average")

    velocity = tx_data.get("velocity_10min", 0)
    if velocity >= 5:
        reasons.append(f"High velocity: {velocity} txns in 10 min")

    return "; ".join(reasons)


# ─────────────────────────────────────────────
# Health Check
# ─────────────────────────────────────────────

@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "API running", "version": "1.0.0"}


# ─────────────────────────────────────────────
# Analyze Endpoint
# ─────────────────────────────────────────────

@app.post(
    "/analyze",
    tags=["Fraud Detection"],
    summary="Analyse a transaction for fraud",
)
async def analyze_transaction(
    transaction: TransactionRequest,
    api_key: str = Security(api_key_header),
) -> Dict[str, Any]:

    # 🔐 API Key Validation
    if api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Unauthorized")

    tx_data = transaction.model_dump()
    logger.info(f"Incoming transaction: {tx_data}")

    start_time = time.time()
    ml_result = None
    rule_result = None

    # ── 1️⃣ Run ML Engine ───────────────────────
    try:
        ml_result = ml_classify(tx_data)
        logger.info(f"ML Result: {ml_result}")
    except Exception as e:
        logger.error(f"ML engine failed: {e}")

    # ── 2️⃣ Run Rule-Based Engine ───────────────
    try:
        rule_result = rule_predict(tx_data)
        logger.info(f"Rule-based result: {rule_result}")
    except Exception as e:
        logger.error(f"Rule engine failed: {e}")

    # ── 3️⃣ Both failed ─────────────────────────
    if ml_result is None and rule_result is None:
        raise HTTPException(status_code=500, detail="Fraud detection system failure")

    latency = round(time.time() - start_time, 4)

    # ── 4️⃣ Final Decision (Rule-Based is primary) ──
    final_prob = rule_result["fraud_probability"] if rule_result else ml_result["fraud_probability"]
    final_decision = rule_result["decision"] if rule_result else ml_result["decision"]
    final_reason = rule_result.get("reason", "") if rule_result else _generate_reason(final_prob, tx_data)
    risk_level = _compute_risk_level(final_prob)

    # 📁 Audit log risky transactions
    if final_decision != "Allow":
        with open("fraud_log.txt", "a") as f:
            f.write(str({
                "tx": tx_data,
                "decision": final_decision,
                "fraud_probability": final_prob
            }) + "\n")

    return {
        "final_decision": final_decision,
        "final_fraud_probability": final_prob,
        "risk_level": risk_level,
        "reason": final_reason,
        "latency_sec": latency,
        "engines": {
            "rule_based": rule_result,
            "ml_model": ml_result,
        }
    }