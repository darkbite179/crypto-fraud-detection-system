"""
preprocess.py — Data preprocessing pipeline.

Steps:
    1. Drop non-numeric identifiers (txId).
    2. Handle missing values via median imputation.
    3. Standardise features with StandardScaler.
    4. Stratified train/test split (80/20).
    5. Apply SMOTE to training set only to balance classes.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from imblearn.over_sampling import SMOTE


def preprocess(
    features_df: pd.DataFrame,
    labels: pd.Series,
    test_size: float = 0.2,
    random_state: int = 42,
) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, StandardScaler, list[str]]:
    """Run the full preprocessing pipeline.

    Parameters
    ----------
    features_df : pd.DataFrame
        Raw feature matrix (may contain txId, time_step, etc.).
    labels : pd.Series
        Binary labels (1 = fraud, 0 = legit).
    test_size : float
        Fraction of data reserved for testing.
    random_state : int
        Seed for reproducibility.

    Returns
    -------
    X_train : np.ndarray   — Training features (SMOTE-resampled).
    X_test  : np.ndarray   — Test features (scaled, NOT resampled).
    y_train : np.ndarray   — Training labels (SMOTE-resampled).
    y_test  : np.ndarray   — Test labels.
    scaler  : StandardScaler — Fitted scaler (needed at prediction time).
    feature_columns : list[str] — Column names used for training.
    """
    # ----- 1. Drop identifier / non-feature columns -------------------------
    drop_cols = [c for c in ["txId", "time_step"] if c in features_df.columns]
    X = features_df.drop(columns=drop_cols)
    feature_columns = list(X.columns)

    # ----- 2. Impute missing values (median) ---------------------------------
    imputer = SimpleImputer(strategy="median")
    X = pd.DataFrame(imputer.fit_transform(X), columns=feature_columns)

    # ----- 3. Train / test split (stratified) --------------------------------
    X_train, X_test, y_train, y_test = train_test_split(
        X, labels.values,
        test_size=test_size,
        stratify=labels.values,
        random_state=random_state,
    )

    # ----- 4. Standard scaling -----------------------------------------------
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)

    # ----- 5. SMOTE on training set only -------------------------------------
    smote = SMOTE(random_state=random_state)
    X_train, y_train = smote.fit_resample(X_train, y_train)

    print(f"[preprocess] Train size after SMOTE: {len(X_train)} "
          f"(fraud: {int(y_train.sum())}, legit: {int((y_train == 0).sum())})")
    print(f"[preprocess] Test size: {len(X_test)}")

    return X_train, X_test, y_train, y_test, scaler, feature_columns
