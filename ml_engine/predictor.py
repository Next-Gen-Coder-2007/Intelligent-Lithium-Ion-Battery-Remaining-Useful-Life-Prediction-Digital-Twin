"""
Battery Prognostics Inference & Prediction Service
==================================================
Handles real-time RUL prediction, confidence bounds estimation,
and remaining life trajectory forecasting across models.
"""

import os
import json
import numpy as np
import pandas as pd
import joblib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, 'ml_engine', 'saved_models')


class BatteryPredictor:
    """Manages loaded models, scalers, and inference pipelines."""
    
    _instance = None
    
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(BatteryPredictor, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
        
    def __init__(self, models_dir=MODELS_DIR):
        if self._initialized:
            return
            
        self.models_dir = models_dir
        self.loaded_models = {}
        self.scalers = {}
        self.benchmarks = {}
        self._load_artifacts()
        self._initialized = True
        
    def _load_artifacts(self):
        """Loads all available joblib models, scalers, and benchmark reports."""
        if not os.path.exists(self.models_dir):
            return
            
        # Load scalers
        for prefix in ['nasa', 'operational']:
            scaler_path = os.path.join(self.models_dir, f"{prefix}_scaler.joblib")
            if os.path.exists(scaler_path):
                self.scalers[prefix] = joblib.load(scaler_path)
                
            json_path = os.path.join(self.models_dir, f"{prefix}_benchmark_results.json")
            if os.path.exists(json_path):
                with open(json_path, 'r') as f:
                    self.benchmarks[prefix] = json.load(f)
                    
        # Discover and load models
        for fname in os.listdir(self.models_dir):
            if fname.endswith('.joblib') and not fname.endswith('_scaler.joblib'):
                key = fname.replace('.joblib', '')
                model_path = os.path.join(self.models_dir, fname)
                try:
                    self.loaded_models[key] = joblib.load(model_path)
                except Exception as e:
                    print(f"Warning: Failed to load model {fname}: {e}")
                    
    def reload(self):
        """Forces reload of models from disk."""
        self._initialized = False
        self._load_artifacts()
        self._initialized = True

    def get_benchmark_report(self, dataset='nasa'):
        """Returns benchmark comparison data."""
        return self.benchmarks.get(dataset, None)

    def predict_single(self, feature_dict, dataset='nasa', model_name='XGBoost'):
        """
        Performs single-cycle RUL prediction with uncertainty estimation.
        """
        safe_model_name = model_name.lower().replace(' ', '_')
        model_key = f"{dataset}_{safe_model_name}"
        
        if model_key not in self.loaded_models:
            # Fallback to first available model for dataset
            matching_keys = [k for k in self.loaded_models if k.startswith(dataset)]
            if matching_keys:
                model_key = matching_keys[0]
            else:
                raise ValueError(f"No trained models found for dataset '{dataset}' and model '{model_name}'")
                
        model = self.loaded_models[model_key]
        scaler = self.scalers.get(dataset)
        benchmark = self.benchmarks.get(dataset)
        
        feature_names = benchmark['feature_names'] if benchmark else list(feature_dict.keys())
        
        # Prepare feature vector in exact order
        row = {}
        for feat in feature_names:
            val = feature_dict.get(feat, 0.0)
            row[feat] = float(val)
            
        X_df = pd.DataFrame([row])
        if scaler is not None:
            X_scaled = scaler.transform(X_df)
        else:
            X_scaled = X_df.values
            
        pred_rul = float(model.predict(X_scaled)[0])
        pred_rul = max(0.0, round(pred_rul, 1))
        
        # Uncertainty estimation: standard deviation across tree estimators if available
        uncertainty = 5.0
        if hasattr(model, 'estimators_') and hasattr(model.estimators_[0], 'predict'):
            tree_preds = [tree.predict(X_scaled)[0] for tree in model.estimators_[:30]]
            uncertainty = round(float(np.std(tree_preds)), 2)
        elif hasattr(model, 'named_estimators_'):
            sub_preds = [est.predict(X_scaled)[0] for est in model.named_estimators_.values()]
            uncertainty = round(float(np.std(sub_preds)), 2)
            
        lower_bound = max(0.0, round(pred_rul - 1.96 * uncertainty, 1))
        upper_bound = round(pred_rul + 1.96 * uncertainty, 1)
        
        # Estimate State of Health percentage if not directly provided
        soh_pct = float(feature_dict.get('SOH_Pct', 0.0))
        if soh_pct == 0.0 and 'Discharge_Capacity_Ah' in feature_dict:
            soh_pct = round((float(feature_dict['Discharge_Capacity_Ah']) / 2.0) * 100.0, 2)
        elif soh_pct == 0.0:
            soh_pct = round(max(50.0, min(100.0, 70.0 + (pred_rul / 150.0) * 30.0)), 2)
            
        # Health status categorization
        if soh_pct >= 90.0:
            health_status = 'Optimal (Healthy)'
            status_color = 'emerald'
        elif soh_pct >= 80.0:
            health_status = 'Good (Moderate Aging)'
            status_color = 'cyan'
        elif soh_pct >= 70.0:
            health_status = 'Warning (Approaching EOL Knee)'
            status_color = 'amber'
        else:
            health_status = 'Critical (EOL Reached - Replace Cell)'
            status_color = 'rose'
            
        return {
            'predicted_rul_cycles': pred_rul,
            'confidence_interval_95': {
                'lower': lower_bound,
                'upper': upper_bound,
                'uncertainty_std': uncertainty
            },
            'state_of_health_pct': soh_pct,
            'health_status': health_status,
            'status_color': status_color,
            'model_used': model_name,
            'dataset_type': dataset
        }

    def predict_trajectory(self, current_cycle, current_capacity, nominal_capacity=2.0, eol_capacity=1.40, ambient_temp_c=24.0, c_rate=1.0):
        """
        Projects full degradation trajectory (Capacity fade & SOH) from current cycle to EOL.
        Combines empirical power-law / Arrhenius degradation physics with ML bounds.
        """
        current_soh = (current_capacity / nominal_capacity) * 100.0
        
        # Temperature Arrhenius factor
        t_kelvin = ambient_temp_c + 273.15
        arrhenius_factor = np.exp((t_kelvin - 298.15) / 35.0)
        
        # C-rate stress multiplier
        c_rate_factor = 1.0 + (c_rate - 1.0) * 0.45
        
        # Effective degradation rate per cycle
        base_rate = 0.0038 * arrhenius_factor * c_rate_factor
        
        remaining_cap = current_capacity - eol_capacity
        if remaining_cap <= 0:
            estimated_rul = 0
        else:
            estimated_rul = int(np.maximum(1, np.round(remaining_cap / base_rate)))
            
        trajectory = []
        total_steps = min(30, max(10, estimated_rul + 10))
        step_size = max(1, int(np.ceil((estimated_rul + 20) / total_steps)))
        
        c_val = current_capacity
        for step_idx in range(total_steps):
            cycle_num = current_cycle + (step_idx * step_size)
            # Power law capacity fade with non-linear accelerated aging knee near EOL
            progress = (step_idx * step_size)
            non_linear_knee = 1.0 + (max(0, progress - (estimated_rul * 0.75)) / max(1, estimated_rul)) ** 2 * 0.8
            cap_fade = progress * base_rate * non_linear_knee
            projected_cap = max(1.10, round(float(current_capacity - cap_fade), 4))
            projected_soh = round(float((projected_cap / nominal_capacity) * 100.0), 2)
            projected_rul = max(0, estimated_rul - progress)
            
            # Uncertainty envelope (grows wider with future steps)
            uncertainty_band = round(0.015 * (step_idx + 1) ** 0.65, 4)
            cap_upper = round(min(nominal_capacity, projected_cap + uncertainty_band), 4)
            cap_lower = round(max(0.8, projected_cap - uncertainty_band), 4)
            
            trajectory.append({
                'cycle': cycle_num,
                'projected_capacity_ah': projected_cap,
                'capacity_upper_bound': cap_upper,
                'capacity_lower_bound': cap_lower,
                'projected_soh_pct': projected_soh,
                'projected_rul_cycles': projected_rul,
                'is_eol': projected_cap <= eol_capacity
            })
            
            if projected_cap <= 1.25 and len(trajectory) > 15:
                break
                
        return {
            'current_cycle': current_cycle,
            'current_capacity_ah': current_capacity,
            'current_soh_pct': round(current_soh, 2),
            'eol_threshold_ah': eol_capacity,
            'eol_soh_threshold_pct': round((eol_capacity / nominal_capacity) * 100.0, 1),
            'estimated_rul_cycles': estimated_rul,
            'trajectory': trajectory
        }
