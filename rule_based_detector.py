"""
rule_based_detector.py — Rule-based fraud detection fallback engine.

Pipeline:
    validate → extract features → score → classify → return JSON
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from logging import getLogger
from types import MappingProxyType
from typing import Any

log = getLogger(__name__)


# ─────────────────────────────────────────────────────────────
# Feature Contract
# ─────────────────────────────────────────────────────────────

@dataclass(frozen=True, slots=True)
class TransactionFeatures:
    amount: float
    amount_to_avg_ratio: float
    is_new_device: bool
    is_new_location: bool
    velocity_10min: int


# ─────────────────────────────────────────────────────────────
# Scoring Abstraction
# ─────────────────────────────────────────────────────────────

class BaseScorer(ABC):
    @abstractmethod
    def score(self, features: TransactionFeatures) -> tuple[float, str]:
        ...


class RiskScorer(BaseScorer):
    _DEFAULT_WEIGHTS: dict[str, float] = {
        "amount_ratio": 0.35,
        "new_device": 0.20,
        "new_location": 0.20,
        "velocity": 0.25,
    }

    def __init__(self, weights: dict[str, float] | None = None) -> None:
        raw = weights or self._DEFAULT_WEIGHTS
        total = sum(raw.values())
        if total <= 0:
            raise ValueError("Weight values must sum to a positive number.")

        self._weights = MappingProxyType(
            {k: v / total for k, v in raw.items()}
        )

    def score(self, features: TransactionFeatures) -> tuple[float, str]:
        reasons: list[str] = []

        # Amount ratio signal
        amount_signal = min(features.amount_to_avg_ratio / 5.0, 1.0)
        if features.amount_to_avg_ratio > 3.0:
            reasons.append(
                f"Amount {features.amount_to_avg_ratio:.1f}x above user average"
            )

        # New device
        device_signal = 1.0 if features.is_new_device else 0.0
        if features.is_new_device:
            reasons.append("New device detected")

        # New location
        location_signal = 1.0 if features.is_new_location else 0.0
        if features.is_new_location:
            reasons.append("New location detected")

        # Velocity signal
        velocity_signal = min(features.velocity_10min / 10.0, 1.0)
        if features.velocity_10min >= 5:
            reasons.append(
                f"High velocity: {features.velocity_10min} txns in 10 min"
            )

        probability = (
            self._weights["amount_ratio"] * amount_signal
            + self._weights["new_device"] * device_signal
            + self._weights["new_location"] * location_signal
            + self._weights["velocity"] * velocity_signal
        )

        probability = max(0.0, min(probability, 1.0))

        reason = (
            "; ".join(reasons)
            if reasons
            else "Transaction within normal parameters"
        )

        return probability, reason


# ─────────────────────────────────────────────────────────────
# Detector Abstraction
# ─────────────────────────────────────────────────────────────

class BaseFraudDetector(ABC):
    @abstractmethod
    def predict(self, transaction: dict[str, Any]) -> dict[str, Any]:
        ...


# ─────────────────────────────────────────────────────────────
# Concrete Rule-Based Detector
# ─────────────────────────────────────────────────────────────

class FraudPredictor(BaseFraudDetector):
    def __init__(
        self,
        fraud_threshold: float = 0.7,
        block_threshold: float = 0.85,
        scorer: BaseScorer | None = None,
        max_transaction_amount: float = 999_999_999.0,
        max_velocity_10min: int = 100,
    ) -> None:

        if not 0.0 <= fraud_threshold <= 1.0:
            raise ValueError("fraud_threshold must be between 0.0 and 1.0")

        self._threshold = fraud_threshold
        self._block_threshold = block_threshold
        self._scorer = scorer or RiskScorer()
        self._max_amount = max_transaction_amount
        self._max_velocity = max_velocity_10min

    # ─────────────────────────────
    # Public API
    # ─────────────────────────────

    def predict(self, transaction: dict[str, Any]) -> dict[str, Any]:
        sanitized = self._validate(transaction)
        features = self._extract_features(sanitized)

        try:
            probability, reason = self._scorer.score(features)
        except Exception:
            log.exception("Scoring failure — activating safe fallback.")
            probability = 1.0
            reason = "Scoring system failure — flagged for manual review"

        # 3-level classification
        if probability >= self._block_threshold:
            decision = "Block"
        elif probability >= self._threshold:
            decision = "Flag"
        else:
            decision = "Allow"

        # Risk level classification
        if probability >= 0.7:
            risk_level = "High"
        elif probability >= 0.3:
            risk_level = "Moderate"
        else:
            risk_level = "Low"

        return {
            "fraud_probability": round(probability, 6),
            "risk_level": risk_level,
            "decision": decision,
            "reason": reason,
        }

    # ─────────────────────────────
    # Validation Stage
    # ─────────────────────────────

    def _validate(self, transaction: dict[str, Any]) -> dict[str, Any]:
        if not isinstance(transaction, dict):
            raise TypeError("Transaction must be a dictionary.")

        if "amount" not in transaction:
            raise ValueError("Transaction must include 'amount'.")

        amount = float(transaction["amount"])
        if amount < 0:
            raise ValueError("'amount' must be >= 0.")
        if amount > self._max_amount:
            raise ValueError(f"Transaction amount exceeds maximum allowed ({self._max_amount}).")

        velocity = int(transaction.get("velocity_10min", 0))
        if velocity < 0:
            raise ValueError("'velocity_10min' must be >= 0.")
        if velocity > self._max_velocity:
            raise ValueError("Velocity exceeds safe limits.")

        return {
            **transaction,
            "amount": amount,
            "velocity_10min": velocity,
        }

    # ─────────────────────────────
    # Feature Extraction Stage
    # ─────────────────────────────

    @staticmethod
    def _extract_features(transaction: dict[str, Any]) -> TransactionFeatures:
        amount = transaction["amount"]

        raw_avg = transaction.get("user_avg_amount")
        if raw_avg:
            user_avg = max(float(raw_avg), 1.0)
        else:
            user_avg = max(amount, 1.0)

        return TransactionFeatures(
            amount=amount,
            amount_to_avg_ratio=amount / user_avg,
            is_new_device=bool(transaction.get("is_new_device", False)),
            is_new_location=bool(transaction.get("is_new_location", False)),
            velocity_10min=transaction["velocity_10min"],
        )

    def __repr__(self) -> str:
        return (
            f"{self.__class__.__name__}"
            f"(threshold={self._threshold}, block={self._block_threshold})"
        )


# ─────────────────────────────────────────────────────────────
# Singleton Instance
# ─────────────────────────────────────────────────────────────

_detector: BaseFraudDetector = FraudPredictor(
    fraud_threshold=0.7,
    block_threshold=0.85,
    max_transaction_amount=999_999_999.0,
    max_velocity_10min=100,
)


def predict_transaction(transaction: dict[str, Any]) -> dict[str, Any]:
    return _detector.predict(transaction)