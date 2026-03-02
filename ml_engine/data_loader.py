"""
data_loader.py — Load the Elliptic Bitcoin Transaction Dataset.

Attempts auto-download via kagglehub; falls back to local CSV files
in a data/raw/ directory relative to the project root.

Elliptic class mapping:
    1 -> 1  (illicit / fraud)
    2 -> 0  (licit  / legit)
    "unknown" -> dropped
"""

import os
import pandas as pd

# ---------------------------------------------------------------------------
# Path configuration
# ---------------------------------------------------------------------------
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_LOCAL_DATA_DIR = os.path.join(_PROJECT_ROOT, "data", "raw")

_FEATURES_FILE = "elliptic_txs_features.csv"
_CLASSES_FILE = "elliptic_txs_classes.csv"
_EDGELIST_FILE = "elliptic_txs_edgelist.csv"


def _try_kagglehub_download() -> str | None:
    """Attempt to download the Elliptic dataset via kagglehub.

    Returns the local directory path on success, or None on failure.
    """
    try:
        import kagglehub
        path = kagglehub.dataset_download("ellipticco/elliptic-data-set")
        print(f"[data_loader] Dataset downloaded via kagglehub -> {path}")
        return path
    except Exception as exc:
        print(f"[data_loader] kagglehub download failed ({exc}); trying local fallback.")
        return None


def _resolve_data_dir() -> str:
    """Return the directory that contains the three Elliptic CSV files."""
    # 1. Try kagglehub auto-download
    kaggle_dir = _try_kagglehub_download()
    if kaggle_dir is not None:
        # kagglehub may nest files one level deeper
        if os.path.isfile(os.path.join(kaggle_dir, _FEATURES_FILE)):
            return kaggle_dir
        for root, _dirs, files in os.walk(kaggle_dir):
            if _FEATURES_FILE in files:
                return root

    # 2. Fall back to local data/raw/
    if os.path.isfile(os.path.join(_LOCAL_DATA_DIR, _FEATURES_FILE)):
        print(f"[data_loader] Using local data directory -> {_LOCAL_DATA_DIR}")
        return _LOCAL_DATA_DIR

    raise FileNotFoundError(
        f"Could not locate Elliptic dataset. Place the CSVs in {_LOCAL_DATA_DIR} "
        "or configure Kaggle credentials for auto-download."
    )


def load_dataset() -> tuple[pd.DataFrame, pd.Series, pd.DataFrame]:
    """Load and return the Elliptic Bitcoin Dataset.

    Returns
    -------
    features_df : pd.DataFrame
        Transaction features (txId + 166 numeric columns).
    labels : pd.Series
        Binary labels aligned with features_df (1 = fraud, 0 = legit).
    edgelist_df : pd.DataFrame
        Two-column DataFrame of directed edges (txId1 -> txId2).
    """
    data_dir = _resolve_data_dir()

    # --- Features -----------------------------------------------------------
    features_df = pd.read_csv(
        os.path.join(data_dir, _FEATURES_FILE),
        header=None,
    )
    # First column is txId, the second is the time-step; rest are features
    col_names = ["txId", "time_step"] + [f"feat_{i}" for i in range(1, features_df.shape[1] - 1)]
    features_df.columns = col_names

    # --- Classes -------------------------------------------------------------
    classes_df = pd.read_csv(
        os.path.join(data_dir, _CLASSES_FILE),
    )
    classes_df.columns = ["txId", "class"]

    # Map labels: "1" -> 1 (fraud), "2" -> 0 (legit), "unknown" -> NaN -> drop
    classes_df["class"] = classes_df["class"].replace({"1": 1, "2": 0, "unknown": None})
    classes_df["class"] = pd.to_numeric(classes_df["class"])
    classes_df = classes_df.dropna(subset=["class"])
    classes_df["class"] = classes_df["class"].astype(int)

    # --- Merge & align -------------------------------------------------------
    merged = features_df.merge(classes_df, on="txId", how="inner")
    labels = merged.pop("class")
    features_df = merged

    # --- Edge list -----------------------------------------------------------
    edgelist_df = pd.read_csv(
        os.path.join(data_dir, _EDGELIST_FILE),
    )
    edgelist_df.columns = ["txId1", "txId2"]

    print(f"[data_loader] Loaded {len(features_df)} labeled transactions, "
          f"{len(edgelist_df)} edges.")
    print(f"[data_loader] Label distribution -> fraud: {int(labels.sum())}, "
          f"legit: {int((labels == 0).sum())}")

    return features_df, labels, edgelist_df
