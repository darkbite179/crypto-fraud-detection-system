"""
model_loader.py — Load the serialised model bundle from saved_model.pkl.

The bundle (created by train_model.py) contains:
    • model           — trained RandomForestClassifier
    • scaler          — fitted StandardScaler
    • graph           — NetworkX DiGraph of wallet interactions
    • feature_columns — ordered list of feature names used during training

Uses singleton-style caching so the bundle is deserialised only once per
process lifetime.
"""

import os
import joblib

_MODULE_DIR = os.path.dirname(os.path.abspath(__file__))
_DEFAULT_MODEL_PATH = os.path.join(_MODULE_DIR, "saved_model.pkl")

# Module-level cache
_cached_bundle: dict | None = None


def load_model(path: str | None = None) -> dict:
    """Load and return the model bundle, caching it for subsequent calls.

    Parameters
    ----------
    path : str, optional
        Path to the ``.pkl`` file.  Defaults to ``ml_engine/saved_model.pkl``.

    Returns
    -------
    dict
        Keys: ``model``, ``scaler``, ``graph``, ``feature_columns``.

    Raises
    ------
    FileNotFoundError
        If the model file does not exist (training has not been run yet).
    """
    global _cached_bundle

    if _cached_bundle is not None:
        return _cached_bundle

    model_path = path or _DEFAULT_MODEL_PATH

    if not os.path.isfile(model_path):
        raise FileNotFoundError(
            f"Model file not found at {model_path}. "
            "Run `python -m ml_engine.train_model` first to train and export the model."
        )

    bundle = joblib.load(model_path)

    # Validate expected keys
    required_keys = {"model", "scaler", "feature_columns"}
    missing = required_keys - set(bundle.keys())
    if missing:
        raise ValueError(
            f"Model bundle is missing required keys: {missing}. "
            "Re-run training to generate a valid bundle."
        )

    _cached_bundle = bundle
    print(f"[model_loader] Model bundle loaded from {model_path}")
    return _cached_bundle


def clear_cache() -> None:
    """Clear the cached model bundle (useful for testing or reloading)."""
    global _cached_bundle
    _cached_bundle = None
    print("[model_loader] Cache cleared.")
