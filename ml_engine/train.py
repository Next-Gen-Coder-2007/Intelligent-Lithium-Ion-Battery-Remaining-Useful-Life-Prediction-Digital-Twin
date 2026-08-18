"""
Lithium-Ion Battery Prognostics & RUL Multi-Model Machine Learning Engine
========================================================================
Benchmarks and trains 5 Machine Learning regression models:
- Random Forest Regressor (Ensemble Bagging)
- Gradient Boosting Regressor (Sequential Boosting)
- XGBoost Regressor (Extreme Gradient Boosting)
- LightGBM Regressor (Histogram-based Fast GBDT)
- Support Vector Regressor (SVR with RBF Kernel)
- Stacking Ensemble Regressor (Meta-learner combination)

Evaluates 5-fold cross-validation, computes error distributions, feature importances,
and persists trained model pipelines to disk for real-time inference in Django & Digital Twin.
"""

import os
import sys
import json
import time
import numpy as np
import pandas as pd
import joblib

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(line_buffering=True)

from sklearn.model_selection import KFold, cross_validate, train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, max_error
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, StackingRegressor
from sklearn.svm import SVR
from sklearn.linear_model import Ridge
import xgboost as xgb
import lightgbm as lgb


def get_feature_cols_nasa():
    return [
        'Discharge_Capacity_Ah',
        'SOH_Pct',
        'Max_Discharge_Voltage_V',
        'Min_Discharge_Voltage_V',
        'Mean_Discharge_Voltage_V',
        'Mean_Discharge_Current_A',
        'Max_Discharge_Temp_C',
        'Mean_Discharge_Temp_C',
        'Discharge_Duration_s',
        'Time_to_3_5V_s',
        'Time_to_3_2V_s',
        'CC_Charge_Time_s',
        'CV_Charge_Time_s',
        'Total_Charge_Time_s',
        'Max_Charge_Temp_C',
        'Electrolyte_Resistance_Re',
        'Charge_Transfer_Resistance_Rct'
    ]


def get_feature_cols_operational():
    return [
        'Discharge Time (s)',
        'Decrement 3.6-3.4V (s)',
        'Max. Voltage Dischar. (V)',
        'Min. Voltage Charg. (V)',
        'Time at 4.15V (s)',
        'Time constant current (s)',
        'Charging time (s)'
    ]


def build_models(random_state=42):
    """Initializes competitive hyperparameter-optimized regression models."""
    return {
        'Random Forest': RandomForestRegressor(
            n_estimators=150,
            max_depth=14,
            min_samples_split=3,
            min_samples_leaf=1,
            max_features='sqrt',
            random_state=random_state,
            n_jobs=-1
        ),
        'Gradient Boosting': GradientBoostingRegressor(
            n_estimators=150,
            learning_rate=0.08,
            max_depth=5,
            subsample=0.85,
            random_state=random_state
        ),
        'XGBoost': xgb.XGBRegressor(
            n_estimators=180,
            learning_rate=0.06,
            max_depth=6,
            subsample=0.85,
            colsample_bytree=0.85,
            reg_alpha=0.1,
            reg_lambda=1.0,
            random_state=random_state,
            n_jobs=-1
        ),
        'LightGBM': lgb.LGBMRegressor(
            n_estimators=180,
            learning_rate=0.06,
            max_depth=6,
            num_leaves=31,
            subsample=0.85,
            colsample_bytree=0.85,
            random_state=random_state,
            n_jobs=-1,
            verbose=-1
        ),
        'SVR': SVR(
            C=100.0,
            epsilon=0.1,
            gamma='scale',
            kernel='rbf',
            max_iter=3000
        )
    }


def evaluate_and_train_all(dataset_path, feature_cols, target_col='RUL', output_dir='ml_engine/saved_models', model_prefix='nasa'):
    """
    Executes 5-fold CV evaluation, trains on train/test split, calculates feature importances,
    and saves serialized joblib models and JSON reports.
    """
    os.makedirs(output_dir, exist_ok=True)
    
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset not found at: {dataset_path}")
        
    df = pd.read_csv(dataset_path)
    
    # Drop rows with missing target or features
    df = df.dropna(subset=feature_cols + [target_col])
    
    X = df[feature_cols].copy()
    y = df[target_col].copy()
    
    # Train-test split (80% train, 20% test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, shuffle=True
    )
    
    # Standard Scaler
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Save Scaler
    scaler_path = os.path.join(output_dir, f"{model_prefix}_scaler.joblib")
    joblib.dump(scaler, scaler_path)
    
    models = build_models()
    
    # Also create a Stacking Ensemble from the top estimators
    base_estimators = [
        ('rf', RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)),
        ('xgb', xgb.XGBRegressor(n_estimators=120, learning_rate=0.08, max_depth=5, random_state=42, n_jobs=-1)),
        ('lgb', lgb.LGBMRegressor(n_estimators=120, learning_rate=0.08, max_depth=5, random_state=42, n_jobs=-1, verbose=-1))
    ]
    stacking_model = StackingRegressor(
        estimators=base_estimators,
        final_estimator=Ridge(alpha=1.0)
    )
    models['Stacking Ensemble'] = stacking_model
    
    benchmark_results = []
    trained_models = {}
    feature_importances_dict = {}
    
    cv = KFold(n_splits=5, shuffle=True, random_state=42)
    
    print(f"\n=======================================================")
    print(f"Training & Benchmarking ML Models on [{model_prefix.upper()}] Dataset")
    print(f"Total Samples: {len(df)} | Features: {len(feature_cols)} | Target: {target_col}")
    print(f"=======================================================")
    
    for name, model in models.items():
        print(f"\nEvaluating {name}...")
        t0 = time.time()
        
        # 5-Fold Cross Validation
        cv_scores = cross_validate(
            model,
            X_train_scaled,
            y_train,
            cv=cv,
            scoring={
                'r2': 'r2',
                'neg_mae': 'neg_mean_absolute_error',
                'neg_rmse': 'neg_root_mean_squared_error'
            },
            n_jobs=-1 if name != 'SVR' else 1
        )
        train_time = time.time() - t0
        
        # Train on full train set
        model.fit(X_train_scaled, y_train)
        trained_models[name] = model
        
        # Inference speed test (time to predict test set)
        t_inf_start = time.time()
        y_test_pred = model.predict(X_test_scaled)
        inf_latency_ms = (time.time() - t_inf_start) * 1000.0 / len(X_test)
        
        # Evaluate on Test Set
        y_train_pred = model.predict(X_train_scaled)
        
        train_r2 = float(r2_score(y_train, y_train_pred))
        test_r2 = float(r2_score(y_test, y_test_pred))
        test_mae = float(mean_absolute_error(y_test, y_test_pred))
        test_rmse = float(np.sqrt(mean_squared_error(y_test, y_test_pred)))
        test_max_err = float(max_error(y_test, y_test_pred))
        
        cv_r2_mean = float(np.mean(cv_scores['test_r2']))
        cv_mae_mean = float(-np.mean(cv_scores['test_neg_mae']))
        cv_rmse_mean = float(-np.mean(cv_scores['test_neg_rmse']))
        
        # Feature Importance Extraction
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_.tolist()
            feature_importances_dict[name] = [
                {'feature': feat, 'importance': round(float(imp), 4)}
                for feat, imp in sorted(zip(feature_cols, importances), key=lambda x: x[1], reverse=True)
            ]
        elif name == 'Stacking Ensemble':
            # Approximate by averaging base estimator importances
            rf_imp = model.named_estimators_['rf'].feature_importances_
            xgb_imp = model.named_estimators_['xgb'].feature_importances_
            lgb_imp = model.named_estimators_['lgb'].feature_importances_
            avg_imp = (rf_imp + xgb_imp + lgb_imp) / 3.0
            feature_importances_dict[name] = [
                {'feature': feat, 'importance': round(float(imp), 4)}
                for feat, imp in sorted(zip(feature_cols, avg_imp), key=lambda x: x[1], reverse=True)
            ]
        else:
            # SVR (magnitude based on standard deviation impact or default placeholder)
            feature_importances_dict[name] = [
                {'feature': feat, 'importance': round(1.0 / len(feature_cols), 4)}
                for feat in feature_cols
            ]
            
        model_result = {
            'model_name': name,
            'train_r2': round(train_r2, 4),
            'test_r2': round(test_r2, 4),
            'cv_r2_mean': round(cv_r2_mean, 4),
            'test_mae': round(test_mae, 2),
            'cv_mae_mean': round(cv_mae_mean, 2),
            'test_rmse': round(test_rmse, 2),
            'cv_rmse_mean': round(cv_rmse_mean, 2),
            'max_error': round(test_max_err, 2),
            'train_time_s': round(train_time, 3),
            'latency_per_sample_ms': round(inf_latency_ms, 4),
            'is_recommended': False
        }
        
        benchmark_results.append(model_result)
        
        print(f"  -> Test R2: {test_r2:.4f} | Test MAE: {test_mae:.2f} cycles | Test RMSE: {test_rmse:.2f} cycles | Latency: {inf_latency_ms:.3f}ms")
        
        # Save individual model joblib
        safe_name = name.lower().replace(' ', '_')
        save_path = os.path.join(output_dir, f"{model_prefix}_{safe_name}.joblib")
        joblib.dump(model, save_path)
        
    # Mark top model as recommended
    benchmark_results.sort(key=lambda x: (-x['test_r2'], x['test_mae']))
    benchmark_results[0]['is_recommended'] = True
    
    # Save benchmark summary JSON
    summary_payload = {
        'dataset_name': model_prefix,
        'total_samples': len(df),
        'train_samples': len(X_train),
        'test_samples': len(X_test),
        'feature_count': len(feature_cols),
        'feature_names': feature_cols,
        'target_name': target_col,
        'best_model': benchmark_results[0]['model_name'],
        'models': benchmark_results,
        'feature_importances': feature_importances_dict,
        'generated_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    }
    
    json_path = os.path.join(output_dir, f"{model_prefix}_benchmark_results.json")
    with open(json_path, 'w') as f:
        json.dump(summary_payload, f, indent=2)
        
    print(f"\n[OK] Benchmark Report Saved: {json_path}")
    print(f"[OK] Best Performing Model: {benchmark_results[0]['model_name']} with R2={benchmark_results[0]['test_r2']}")
    return summary_payload


def run_all_training():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    output_dir = os.path.join(base_dir, 'ml_engine', 'saved_models')
    
    # 1. Train NASA Electrochemical Dataset
    nasa_csv = os.path.join(base_dir, 'dataset_nasa', 'nasa_battery_raw_features.csv')
    if os.path.exists(nasa_csv):
        print("Starting NASA Dataset Training Pipeline...")
        evaluate_and_train_all(
            dataset_path=nasa_csv,
            feature_cols=get_feature_cols_nasa(),
            target_col='RUL',
            output_dir=output_dir,
            model_prefix='nasa'
        )
    else:
        print(f"Warning: {nasa_csv} not found.")
        
    # 2. Train Operational Scaled Dataset
    op_csv = os.path.join(base_dir, 'standard_scaled_dataset.csv')
    if os.path.exists(op_csv):
        print("\nStarting Operational Dataset Training Pipeline...")
        evaluate_and_train_all(
            dataset_path=op_csv,
            feature_cols=get_feature_cols_operational(),
            target_col='RUL',
            output_dir=output_dir,
            model_prefix='operational'
        )
    else:
        print(f"Warning: {op_csv} not found.")


if __name__ == '__main__':
    run_all_training()
