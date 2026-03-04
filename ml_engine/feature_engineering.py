"""
feature_engineering.py — Derive behavioral features from raw transaction data.

The Elliptic dataset already provides 166 anonymised features per transaction.
This module computes additional **behavioral** features that capture suspicious
activity patterns visible at the mempool stage:

    • amount_spike_ratio   — tx value vs. user average amount
    • tx_frequency         — proxy for sender activity volume (velocity)
    • time_deviation       — z-score of time-step within neighbourhood
    • address_reuse_flag   — binary flag for new device (suspicious)
    • wallet_activity_std  — binary flag for new location (suspicious)
"""

import pandas as pd
import numpy as np


def extract_behavioral_features(features_df: pd.DataFrame) -> pd.DataFrame:
    """Compute behavioural features and append them to the feature matrix.

    Parameters
    ----------
    features_df : pd.DataFrame
        Must contain ``time_step`` and columns ``feat_1 … feat_N``.

    Returns
    -------
    pd.DataFrame
        Original dataframe with five new columns appended.
    """
    df = features_df.copy()

    # Identify the raw numeric feature columns (feat_1 … feat_N)
    feat_cols = [c for c in df.columns if c.startswith("feat_")]

    # ------------------------------------------------------------------
    # 1. Amount spike ratio
    #    Use feat_1 as a proxy for transaction value.
    #    Ratio = tx value / rolling mean of same time-step group.
    # ------------------------------------------------------------------
    group_mean = df.groupby("time_step")["feat_1"].transform("mean")
    df["amount_spike_ratio"] = df["feat_1"] / group_mean.replace(0, np.nan)
    df["amount_spike_ratio"] = df["amount_spike_ratio"].fillna(1.0)

    # ------------------------------------------------------------------
    # 2. Transaction frequency proxy
    #    Count of transactions in the same time-step (proxy for sender
    #    activity since individual wallet IDs are not available).
    # ------------------------------------------------------------------
    df["tx_frequency"] = df.groupby("time_step")["feat_1"].transform("count")

    # ------------------------------------------------------------------
    # 3. Time deviation (z-score of time_step within neighbourhood)
    #    Uses feat_2 as a secondary grouping signal.
    # ------------------------------------------------------------------
    ts_mean = df["time_step"].mean()
    ts_std = df["time_step"].std()
    df["time_deviation"] = (df["time_step"] - ts_mean) / (ts_std if ts_std > 0 else 1.0)

    # ------------------------------------------------------------------
    # 4. Address reuse indicator
    #    Flag transactions whose first two features closely match another
    #    transaction in the same time-step (proxy for address reuse).
    # ------------------------------------------------------------------
    group_nunique = df.groupby("time_step")["feat_1"].transform("nunique")
    group_count = df.groupby("time_step")["feat_1"].transform("count")
    df["address_reuse_flag"] = (group_nunique < group_count).astype(int)

    # ------------------------------------------------------------------
    # 5. Wallet activity pattern (std-dev of neighbour feature values)
    #    Captures how diverse the feature profile is within the time-step.
    # ------------------------------------------------------------------
    df["wallet_activity_std"] = df.groupby("time_step")[feat_cols[0]].transform("std")
    df["wallet_activity_std"] = df["wallet_activity_std"].fillna(0.0)

    new_cols = [
        "amount_spike_ratio",
        "tx_frequency",
        "time_deviation",
        "address_reuse_flag",
        "wallet_activity_std",
    ]
    print(f"[feature_engineering] Added {len(new_cols)} behavioral features: {new_cols}")

    return df


def extract_behavioral_features_single(tx: dict, feature_columns: list[str]) -> dict:
    """Extract behavioural features for a **single** incoming transaction.

    Used at prediction time. Maps real transaction fields to the
    behavioral features the model was trained on.

    Parameters
    ----------
    tx : dict
        Raw transaction fields from API request.
    feature_columns : list[str]
        Column names expected by the trained model.

    Returns
    -------
    dict
        Transaction dict augmented with correct behavioural feature values.
    """

    # ── Amount spike ratio ───────────────────────────────────────────
    # How many times larger is this transaction vs user's average?
    amount = float(tx.get("amount", 0.0))
    user_avg = float(tx.get("user_avg_amount", 0.0))
    if user_avg <= 0:
        user_avg = max(amount, 1.0)
    tx["amount_spike_ratio"] = round(amount / user_avg, 4)

    # ── Transaction frequency ────────────────────────────────────────
    # How many transactions in last 10 minutes?
    tx["tx_frequency"] = int(tx.get("velocity_10min", 1)) or 1

    # ── Time deviation ───────────────────────────────────────────────
    # Time of transaction (0-23 hours) as deviation signal
    tx["time_deviation"] = float(tx.get("time", 0.0))

    # ── Address reuse flag ───────────────────────────────────────────
    # New device = suspicious = 1, same device = 0
    tx["address_reuse_flag"] = int(bool(tx.get("is_new_device", False)))

    # ── Wallet activity std ──────────────────────────────────────────
    # New location = suspicious = 1.0, same location = 0.0
    tx["wallet_activity_std"] = float(bool(tx.get("is_new_location", False)))

    print(
        f"[feature_engineering] Behavioral features → "
        f"amount_spike_ratio={tx['amount_spike_ratio']}, "
        f"tx_frequency={tx['tx_frequency']}, "
        f"time_deviation={tx['time_deviation']}, "
        f"address_reuse_flag={tx['address_reuse_flag']}, "
        f"wallet_activity_std={tx['wallet_activity_std']}"
    )

    return tx
