
import json
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    precision_score,
    r2_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier, XGBRegressor


PROJECT_FEATURES = [
    'gender_code',
    'attendance_percentage',
    'assignment_completion',
    'current_cgpa',
    'previous_cgpa',
    'average_internal_marks',
    'average_total_marks',
    'subjects_enrolled',
    'subjects_evaluated',
    'subjects_passed',
    'subjects_credited',
    'age_at_enrollment',
    'debtor',
    'tuition_fees_up_to_date',
    'scholarship_holder',
    'educational_special_needs',
    'international',
    'course_code',
    'daytime_attendance',
    'displaced',
    'unemployment_rate',
    'inflation_rate',
    'gdp',
]

ROOT = Path(__file__).resolve().parent
RAW_DATASET_PATH = ROOT / 'raw_data' / 'uci_dropout_base_dataset.csv'
ARTIFACTS = ROOT / 'model_artifacts'
RISK_DATASET_PATH = ARTIFACTS / 'smart_ai_risk_training_dataset.csv'
PERFORMANCE_DATASET_PATH = ARTIFACTS / 'smart_ai_performance_training_dataset.csv'
RISK_MODEL_PATH = ARTIFACTS / 'smart_ai_dropout_risk_model.pkl'
PERFORMANCE_MODEL_PATH = ARTIFACTS / 'smart_ai_performance_model.pkl'
METADATA_PATH = ARTIFACTS / 'model_metadata.json'
FEATURE_DEFAULTS_PATH = ARTIFACTS / 'feature_defaults.json'


def clamp_series(series, lower, upper):
    return series.clip(lower=lower, upper=upper)


def build_common_features(df: pd.DataFrame, mode: str) -> pd.DataFrame:
    if mode == 'risk':
        enrolled = (df['Curricular units 1st sem (enrolled)'] + df['Curricular units 2nd sem (enrolled)']).astype(float)
        evaluations = (df['Curricular units 1st sem (evaluations)'] + df['Curricular units 2nd sem (evaluations)']).astype(float)
        approved = (df['Curricular units 1st sem (approved)'] + df['Curricular units 2nd sem (approved)']).astype(float)
        credited = (df['Curricular units 1st sem (credited)'] + df['Curricular units 2nd sem (credited)']).astype(float)
        grade_current = ((df['Curricular units 1st sem (grade)'] + df['Curricular units 2nd sem (grade)']) / 2.0).astype(float)
        grade_previous = df['Curricular units 1st sem (grade)'].astype(float)
    else:
        enrolled = df['Curricular units 1st sem (enrolled)'].astype(float)
        evaluations = df['Curricular units 1st sem (evaluations)'].astype(float)
        approved = df['Curricular units 1st sem (approved)'].astype(float)
        credited = df['Curricular units 1st sem (credited)'].astype(float)
        grade_current = df['Curricular units 1st sem (grade)'].astype(float)
        grade_previous = grade_current.copy()

    eval_ratio = evaluations / np.maximum(enrolled, 1.0)
    approved_ratio = approved / np.maximum(enrolled, 1.0)

    attendance_percentage = ((0.55 * np.minimum(eval_ratio, 1.0)) + (0.45 * np.minimum(approved_ratio, 1.0))) * 100.0
    assignment_completion = np.minimum(eval_ratio, 1.0)

    current_cgpa = clamp_series(grade_current / 2.0, 0.0, 10.0)
    previous_cgpa = clamp_series(grade_previous / 2.0, 0.0, 10.0)

    average_internal_marks = clamp_series(grade_current * 5.0, 0.0, 100.0)
    average_total_marks = clamp_series(grade_current * 5.0, 0.0, 100.0)

    return pd.DataFrame({
        'gender_code': df['Gender'].astype(float),
        'attendance_percentage': attendance_percentage.round(2),
        'assignment_completion': assignment_completion.round(4),
        'current_cgpa': current_cgpa.round(2),
        'previous_cgpa': previous_cgpa.round(2),
        'average_internal_marks': average_internal_marks.round(2),
        'average_total_marks': average_total_marks.round(2),
        'subjects_enrolled': enrolled.astype(int),
        'subjects_evaluated': evaluations.astype(int),
        'subjects_passed': approved.astype(int),
        'subjects_credited': credited.astype(int),
        'age_at_enrollment': df['Age at enrollment'].astype(float),
        'debtor': df['Debtor'].astype(float),
        'tuition_fees_up_to_date': df['Tuition fees up to date'].astype(float),
        'scholarship_holder': df['Scholarship holder'].astype(float),
        'educational_special_needs': df['Educational special needs'].astype(float),
        'international': df['International'].astype(float),
        'course_code': df['Course'].astype(float),
        'daytime_attendance': df['Daytime/evening attendance'].astype(float),
        'displaced': df['Displaced'].astype(float),
        'unemployment_rate': df['Unemployment rate'].astype(float),
        'inflation_rate': df['Inflation rate'].astype(float),
        'gdp': df['GDP'].astype(float),
    })


def build_risk_dataset(df: pd.DataFrame) -> pd.DataFrame:
    risk_df = build_common_features(df, mode='risk')
    risk_df['dropout_target'] = (df['Target'].astype(str).str.lower() == 'dropout').astype(int)
    return risk_df


def build_performance_dataset(df: pd.DataFrame) -> pd.DataFrame:
    perf_df = build_common_features(df, mode='performance')
    perf_df['next_sem_cgpa_target'] = clamp_series(df['Curricular units 2nd sem (grade)'].astype(float) / 2.0, 0.0, 10.0).round(2)
    return perf_df


def to_builtin(value):
    if isinstance(value, (np.floating, np.integer)):
        return value.item()
    return value


def main():
    ARTIFACTS.mkdir(parents=True, exist_ok=True)

    raw_df = pd.read_csv(RAW_DATASET_PATH)
    risk_df = build_risk_dataset(raw_df)
    performance_df = build_performance_dataset(raw_df)

    risk_df.to_csv(RISK_DATASET_PATH, index=False)
    performance_df.to_csv(PERFORMANCE_DATASET_PATH, index=False)

    X_risk = risk_df[PROJECT_FEATURES]
    y_dropout = risk_df['dropout_target']

    X_train_cls, X_test_cls, y_train_cls, y_test_cls = train_test_split(
        X_risk, y_dropout, test_size=0.2, random_state=42, stratify=y_dropout
    )

    risk_model = XGBClassifier(
        n_estimators=250,
        max_depth=4,
        learning_rate=0.05,
        subsample=1.0,
        colsample_bytree=0.9,
        objective='binary:logistic',
        eval_metric='logloss',
        random_state=42,
        n_jobs=1,
    )
    risk_model.fit(X_train_cls, y_train_cls)

    risk_probs = risk_model.predict_proba(X_test_cls)[:, 1]
    risk_preds = (risk_probs >= 0.5).astype(int)

    risk_metrics = {
        'accuracy': round(float(accuracy_score(y_test_cls, risk_preds)), 6),
        'precision': round(float(precision_score(y_test_cls, risk_preds)), 6),
        'recall': round(float(recall_score(y_test_cls, risk_preds)), 6),
        'f1': round(float(f1_score(y_test_cls, risk_preds)), 6),
        'rocAuc': round(float(roc_auc_score(y_test_cls, risk_probs)), 6),
    }

    X_perf = performance_df[PROJECT_FEATURES]
    y_performance = performance_df['next_sem_cgpa_target']

    X_train_reg, X_test_reg, y_train_reg, y_test_reg = train_test_split(
        X_perf, y_performance, test_size=0.2, random_state=42
    )

    performance_model = XGBRegressor(
        n_estimators=600,
        max_depth=3,
        learning_rate=0.03,
        subsample=0.95,
        colsample_bytree=0.9,
        objective='reg:squarederror',
        random_state=42,
        n_jobs=1,
    )
    performance_model.fit(X_train_reg, y_train_reg)

    perf_preds = performance_model.predict(X_test_reg)
    rmse = float(mean_squared_error(y_test_reg, perf_preds) ** 0.5)

    performance_metrics = {
        'mae': round(float(mean_absolute_error(y_test_reg, perf_preds)), 6),
        'rmse': round(rmse, 6),
        'r2': round(float(r2_score(y_test_reg, perf_preds)), 6),
    }

    joblib.dump(risk_model, RISK_MODEL_PATH)
    joblib.dump(performance_model, PERFORMANCE_MODEL_PATH)

    defaults = {
        name: to_builtin(risk_df[name].median())
        for name in PROJECT_FEATURES
    }
    FEATURE_DEFAULTS_PATH.write_text(json.dumps(defaults, indent=2))

    feature_importances = sorted(
        [
            {'feature': feature, 'importance': round(float(score), 6)}
            for feature, score in zip(PROJECT_FEATURES, risk_model.feature_importances_)
        ],
        key=lambda item: item['importance'],
        reverse=True,
    )

    metadata = {
        'modelName': 'Smart AI Academic Intelligence Model Suite',
        'trainedAt': datetime.now(timezone.utc).isoformat(),
        'datasetBase': {
            'name': "UCI Predict Students' Dropout and Academic Success",
            'doi': '10.24432/C5MC89',
            'sourceFile': 'backend/ml/raw_data/uci_dropout_base_dataset.csv',
            'baseRows': int(raw_df.shape[0]),
            'baseColumns': int(raw_df.shape[1]),
        },
        'riskDataset': {
            'name': 'smart_ai_risk_training_dataset.csv',
            'rows': int(risk_df.shape[0]),
            'columns': int(risk_df.shape[1]),
            'path': 'backend/ml/model_artifacts/smart_ai_risk_training_dataset.csv',
            'features': PROJECT_FEATURES,
            'target': 'dropout_target',
            'featureMode': 'current-state aggregated project fields',
        },
        'performanceDataset': {
            'name': 'smart_ai_performance_training_dataset.csv',
            'rows': int(performance_df.shape[0]),
            'columns': int(performance_df.shape[1]),
            'path': 'backend/ml/model_artifacts/smart_ai_performance_training_dataset.csv',
            'features': PROJECT_FEATURES,
            'target': 'next_sem_cgpa_target',
            'featureMode': 'early-state project fields mapped from first-sem data',
        },
        'riskModel': {
            'task': 'Binary classification',
            'target': 'dropout_target',
            'artifact': 'backend/ml/model_artifacts/smart_ai_dropout_risk_model.pkl',
            'metrics': risk_metrics,
            'topFeatures': feature_importances[:10],
        },
        'performanceModel': {
            'task': 'Regression',
            'target': 'next_sem_cgpa_target',
            'artifact': 'backend/ml/model_artifacts/smart_ai_performance_model.pkl',
            'metrics': performance_metrics,
        },
        'notes': [
            'The public base dataset was transformed into project-aligned CSV files so the backend can use your own field names instead of the original research columns.',
            'The dropout model uses current-state academic and financial fields that best match your ERP-style student records.',
            'The performance model predicts next-semester CGPA from earlier-state project fields, replacing the previous hard-coded CGPA formula.',
        ],
    }

    METADATA_PATH.write_text(json.dumps(metadata, indent=2))
    print(json.dumps({'success': True, 'metadata': metadata}))


if __name__ == '__main__':
    main()
