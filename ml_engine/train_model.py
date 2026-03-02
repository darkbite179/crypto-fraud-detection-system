"""
train_model.py — Training pipeline for the fraud detection model.

Orchestrates the full flow:
    1. Load Elliptic dataset
    2. Engineer behavioural features
    3. Build wallet graph & extract graph features
    4. Preprocess (scale, split, SMOTE)
    5. Train Random Forest classifier (CPU-only, lightweight)
    6. Evaluate (precision, recall, F1-score)
    7. Export trained model bundle to saved_model.pkl via joblib

Usage:
    python -m ml_engine.train_model
"""

import os
import time
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, precision_score, recall_score, f1_score

from ml_engine.data_loader import load_dataset
from ml_engine.feature_engineering import extract_behavioral_features
from ml_engine.graph_builder import build_graph, extract_graph_features
from ml_engine.preprocess import preprocess

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
_MODULE_DIR = os.path.dirname(os.path.abspath(__file__))
_MODEL_PATH = os.path.join(_MODULE_DIR, "saved_model.pkl")


def train() -> dict:
    """Run the complete training pipeline and return evaluation metrics.

    Returns
    -------
    dict
        Keys: precision, recall, f1, model_path.
    """
    print("=" * 70)
    print("  Pre-Consensus Blockchain Fraud Detection — Training Pipeline")
    print("=" * 70)

    # ── 1. Load dataset ─────────────────────────────────────────────────
    print("\n[1/6] Loading Elliptic Bitcoin Dataset ...")
    features_df, labels, edgelist_df = load_dataset()

    # ── 2. Behavioural feature engineering ──────────────────────────────
    print("\n[2/6] Extracting behavioural features ...")
    features_df = extract_behavioral_features(features_df)

    # ── 3. Graph construction & graph features ──────────────────────────
    print("\n[3/6] Building wallet interaction graph ...")
    graph = build_graph(edgelist_df)

    node_ids = features_df["txId"].values
    graph_feats = extract_graph_features(graph, node_ids)

    # Merge graph features into the feature matrix
    features_df = features_df.merge(graph_feats, on="txId", how="left")
    for col in ["in_degree", "out_degree", "degree_centrality", "clustering_coeff"]:
        features_df[col] = features_df[col].fillna(0)

    # ── 4. Preprocessing (scale, split, SMOTE) ──────────────────────────
    print("\n[4/6] Preprocessing ...")
    X_train, X_test, y_train, y_test, scaler, feature_columns = preprocess(
        features_df, labels
    )

    # ── 5. Train Random Forest (CPU-only, lightweight) ──────────────────
    print("\n[5/6] Training Random Forest classifier ...")
    start = time.time()

    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=20,
        min_samples_split=5,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,          # use all CPU cores
    )
    model.fit(X_train, y_train)

    elapsed = time.time() - start
    print(f"[train_model] Training completed in {elapsed:.1f}s")

    # ── 6. Evaluate ─────────────────────────────────────────────────────
    print("\n[6/6] Evaluating on test set ...")
    y_pred = model.predict(X_test)

    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)

    print("\n" + "─" * 50)
    print("  Classification Report")
    print("─" * 50)
    print(classification_report(
        y_test, y_pred,
        target_names=["Legit (0)", "Fraud (1)"],
        zero_division=0,
    ))
    print(f"  Precision : {precision:.4f}")
    print(f"  Recall    : {recall:.4f}")
    print(f"  F1-Score  : {f1:.4f}")
    print("─" * 50)

    # ── 7. Export model bundle ──────────────────────────────────────────
    bundle = {
        "model": model,
        "scaler": scaler,
        "graph": graph,
        "feature_columns": feature_columns,
    }
    joblib.dump(bundle, _MODEL_PATH)
    file_size_mb = os.path.getsize(_MODEL_PATH) / (1024 * 1024)
    print(f"\n[train_model] Model bundle saved -> {_MODEL_PATH}  ({file_size_mb:.1f} MB)")

    return {
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "model_path": _MODEL_PATH,
    }


# ── CLI entry point ────────────────────────────────────────────────────────
if __name__ == "__main__":
    metrics = train()
    print("\n[OK] Training pipeline completed successfully.")
    print(f"  Fraud detection F1-score: {metrics['f1']:.4f}")
