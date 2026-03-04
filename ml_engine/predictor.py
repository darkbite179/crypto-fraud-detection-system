"""
predictor.py — Real-time fraud probability prediction for incoming transactions.

Main interface:
    predict_transaction(tx: dict) → float   (fraud probability 0–1)

Pipeline at prediction time:
    1. Load model bundle (cached after first call)
    2. Extract behavioural features from the transaction dict
    3. Extract graph features (update graph with new edges if provided)
    4. Combine into feature vector matching training schema
    5. Scale with the saved StandardScaler
    6. Predict fraud probability via the trained model
"""

import numpy as np
import pandas as pd

from ml_engine.model_loader import load_model
from ml_engine.feature_engineering import extract_behavioral_features_single
from ml_engine.graph_builder import get_graph_features_for_single_node, update_graph


def predict_transaction(tx: dict) -> float:
    """Return the fraud probability for a single transaction.

    Parameters
    ----------
    tx : dict
        Raw transaction data.  Expected keys should include the feature
        columns used during training (``feat_1`` … ``feat_N``, ``time_step``,
        etc.).  Missing features are filled with zeros.

        Optional keys:
            ``txId``  — used for graph feature lookup.
            ``edges`` — list of ``(src, dst)`` tuples to update the graph
                        before prediction.

    Returns
    -------
    float
        Fraud probability in [0, 1].
    """
    # ── 1. Load model artifacts ─────────────────────────────────────────
    bundle = load_model()
    model = bundle["model"]
    scaler = bundle["scaler"]
    graph = bundle.get("graph")
    feature_columns = bundle["feature_columns"]

    # ── 2. Behavioural features ─────────────────────────────────────────
    tx = extract_behavioral_features_single(tx, feature_columns)

    # ── 3. Graph features ───────────────────────────────────────────────
    # Optionally update graph with new edges
    new_edges = tx.pop("edges", None)
    if new_edges and graph is not None:
        update_graph(graph, new_edges)

    tx_id = tx.get("txId")
    graph_feats = get_graph_features_for_single_node(graph, tx_id)
    tx.update(graph_feats)

    # ── 4. Assemble feature vector ──────────────────────────────────────
    # Build a single-row DataFrame aligned with training columns
    row = {}
    for col in feature_columns:
        row[col] = tx.get(col, 0.0)

    X = pd.DataFrame([row], columns=feature_columns)

    # ── 5. Scale ────────────────────────────────────────────────────────
    X_scaled = scaler.transform(X.values)

    # ── 6. Predict ──────────────────────────────────────────────────────
    proba = model.predict_proba(X_scaled)[0]

    # proba is [P(legit), P(fraud)] — return P(fraud)
    fraud_probability = float(proba[1]) if len(proba) > 1 else float(proba[0])

    return fraud_probability


def classify_transaction(tx: dict, flag_threshold: float = 0.5, block_threshold: float = 0.85) -> dict:
    """Predict fraud probability and classify the transaction.

    Parameters
    ----------
    tx : dict
        Raw transaction data (same format as ``predict_transaction``).
    flag_threshold : float
        Probability above which the transaction is flagged for review.
    block_threshold : float
        Probability above which the transaction is blocked outright.

    Returns
    -------
    dict
        Keys: ``fraud_probability``, ``decision`` (Allow / Flag / Block).
    """
    prob = predict_transaction(tx)

    if prob >= block_threshold:
        decision = "Block"
    elif prob >= flag_threshold:
        decision = "Flag"
    else:
        decision = "Allow"

    return {
        "fraud_probability": round(prob, 6),
        "decision": decision,
    }

