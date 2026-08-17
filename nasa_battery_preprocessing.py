"""
NASA Prognostics Center of Excellence (PCoE) Battery Dataset Preprocessing Pipeline
===================================================================================
This module extracts, processes, and standardizes multi-channel cycling telemetry
from raw MATLAB (.mat) files for NASA 18650 Li-ion cells (B0005, B0006, B0007, B0018).

Engineered Features:
- Cycle_Index: Cumulative charge-discharge cycle number
- Discharge_Capacity_Ah: Measured discharge capacity per cycle
- SOH_Pct: State of Health percentage relative to nominal 2.0 Ah capacity
- Max_Discharge_Voltage_V: Maximum terminal voltage during discharge
- Min_Discharge_Voltage_V: Minimum cutoff voltage during discharge
- Mean_Discharge_Voltage_V: Mean operating voltage during discharge
- Mean_Discharge_Current_A: Mean discharge load current
- Max_Discharge_Temp_C: Peak cell temperature reached during discharge
- Mean_Discharge_Temp_C: Average operating temperature during discharge
- Discharge_Duration_s: Total duration of the discharge cycle
- Time_to_3_5V_s: Dwell duration before cell voltage drops below 3.5V
- Time_to_3_2V_s: Dwell duration before cell voltage drops below 3.2V
- CC_Charge_Time_s: Constant Current (CC) charging duration
- CV_Charge_Time_s: Constant Voltage (CV) charging duration
- Total_Charge_Time_s: Total duration of the charging cycle
- Max_Charge_Temp_C: Maximum temperature during charging
- Electrolyte_Resistance_Re: Internal electrolyte resistance from impedance spectroscopy (Ohms)
- Charge_Transfer_Resistance_Rct: Charge transfer resistance from impedance spectroscopy (Ohms)
- RUL (Target): Remaining Useful Life in cycles until reaching End of Life (EOL = 1.40 Ah / 70% SOH)
"""

import os
import sys
import numpy as np
import pandas as pd
import scipy.io as sio
from sklearn.preprocessing import StandardScaler

def extract_single_battery(mat_path, battery_id, nominal_capacity=2.0, eol_threshold=1.40):
    """
    Extracts time-series features from charge, discharge, and impedance cycles
    of a single NASA battery .mat file.
    """
    if not os.path.exists(mat_path):
        raise FileNotFoundError(f"File not found: {mat_path}")
        
    mat = sio.loadmat(mat_path)
    battery = mat[battery_id][0, 0]
    cycles = battery['cycle'][0]
    
    last_Re = np.nan
    last_Rct = np.nan
    
    charge_info = {}
    charge_idx = 0
    
    # First pass: parse impedance and charge telemetry
    for c in cycles:
        t = c['type'][0]
        d = c['data'][0, 0]
        
        if t == 'impedance':
            if 'Re' in d.dtype.names and len(d['Re']) > 0:
                last_Re = float(d['Re'][0][0])
            if 'Rct' in d.dtype.names and len(d['Rct']) > 0:
                last_Rct = float(d['Rct'][0][0])
                
        elif t == 'charge':
            charge_idx += 1
            v_meas = d['Voltage_measured'][0] if 'Voltage_measured' in d.dtype.names else []
            c_meas = d['Current_measured'][0] if 'Current_measured' in d.dtype.names else []
            temp_meas = d['Temperature_measured'][0] if 'Temperature_measured' in d.dtype.names else []
            t_meas = d['Time'][0] if 'Time' in d.dtype.names else []
            
            cc_time = np.nan
            cv_time = np.nan
            total_chg_time = np.nan
            max_chg_temp = np.nan
            
            if len(v_meas) > 0 and len(t_meas) > 0:
                total_chg_time = float(t_meas[-1] - t_meas[0])
                cc_indices = np.where(v_meas >= 4.19)[0]
                if len(cc_indices) > 0:
                    cc_time = float(t_meas[cc_indices[0]])
                    cv_time = float(total_chg_time - cc_time)
                else:
                    cc_time = total_chg_time
                    cv_time = 0.0
                    
            if len(temp_meas) > 0:
                max_chg_temp = float(np.max(temp_meas))
                
            charge_info[charge_idx] = {
                'CC_Charge_Time_s': cc_time,
                'CV_Charge_Time_s': cv_time,
                'Total_Charge_Time_s': total_chg_time,
                'Max_Charge_Temp_C': max_chg_temp
            }
            
    # Second pass: parse discharge cycles and pair with charge/impedance metrics
    records = []
    dis_idx = 0
    
    for c in cycles:
        t = c['type'][0]
        if t != 'discharge':
            continue
            
        dis_idx += 1
        d = c['data'][0, 0]
        
        cap = float(d['Capacity'][0][0]) if ('Capacity' in d.dtype.names and len(d['Capacity']) > 0) else np.nan
        v_meas = d['Voltage_measured'][0] if 'Voltage_measured' in d.dtype.names else []
        c_meas = d['Current_measured'][0] if 'Current_measured' in d.dtype.names else []
        temp_meas = d['Temperature_measured'][0] if 'Temperature_measured' in d.dtype.names else []
        t_meas = d['Time'][0] if 'Time' in d.dtype.names else []
        
        v_max = float(np.max(v_meas)) if len(v_meas) > 0 else np.nan
        v_min = float(np.min(v_meas)) if len(v_meas) > 0 else np.nan
        v_mean = float(np.mean(v_meas)) if len(v_meas) > 0 else np.nan
        c_mean = float(np.mean(c_meas)) if len(c_meas) > 0 else np.nan
        temp_max = float(np.max(temp_meas)) if len(temp_meas) > 0 else np.nan
        temp_mean = float(np.mean(temp_meas)) if len(temp_meas) > 0 else np.nan
        dis_duration = float(t_meas[-1] - t_meas[0]) if len(t_meas) > 0 else np.nan
        
        t_to_3_5V = np.nan
        t_to_3_2V = np.nan
        if len(v_meas) > 0 and len(t_meas) > 0:
            idx_35 = np.where(v_meas <= 3.5)[0]
            if len(idx_35) > 0:
                t_to_3_5V = float(t_meas[idx_35[0]])
            idx_32 = np.where(v_meas <= 3.2)[0]
            if len(idx_32) > 0:
                t_to_3_2V = float(t_meas[idx_32[0]])
                
        chg = charge_info.get(dis_idx, {
            'CC_Charge_Time_s': np.nan,
            'CV_Charge_Time_s': np.nan,
            'Total_Charge_Time_s': np.nan,
            'Max_Charge_Temp_C': np.nan
        })
        
        records.append({
            'Battery_ID': battery_id,
            'Cycle_Index': dis_idx,
            'Discharge_Capacity_Ah': cap,
            'SOH_Pct': (cap / nominal_capacity) * 100.0 if not np.isnan(cap) else np.nan,
            'Max_Discharge_Voltage_V': v_max,
            'Min_Discharge_Voltage_V': v_min,
            'Mean_Discharge_Voltage_V': v_mean,
            'Mean_Discharge_Current_A': c_mean,
            'Max_Discharge_Temp_C': temp_max,
            'Mean_Discharge_Temp_C': temp_mean,
            'Discharge_Duration_s': dis_duration,
            'Time_to_3_5V_s': t_to_3_5V,
            'Time_to_3_2V_s': t_to_3_2V,
            'CC_Charge_Time_s': chg['CC_Charge_Time_s'],
            'CV_Charge_Time_s': chg['CV_Charge_Time_s'],
            'Total_Charge_Time_s': chg['Total_Charge_Time_s'],
            'Max_Charge_Temp_C': chg['Max_Charge_Temp_C'],
            'Electrolyte_Resistance_Re': last_Re,
            'Charge_Transfer_Resistance_Rct': last_Rct
        })
        
    df_bat = pd.DataFrame(records)
    
    # Impute initial impedance forward/backward fill if first cycle lacked impedance check
    df_bat['Electrolyte_Resistance_Re'] = df_bat['Electrolyte_Resistance_Re'].bfill().ffill()
    df_bat['Charge_Transfer_Resistance_Rct'] = df_bat['Charge_Transfer_Resistance_Rct'].bfill().ffill()
    df_bat['Max_Charge_Temp_C'] = df_bat['Max_Charge_Temp_C'].bfill().ffill()
    df_bat['CC_Charge_Time_s'] = df_bat['CC_Charge_Time_s'].bfill().ffill()
    df_bat['CV_Charge_Time_s'] = df_bat['CV_Charge_Time_s'].bfill().ffill()
    df_bat['Total_Charge_Time_s'] = df_bat['Total_Charge_Time_s'].bfill().ffill()
    
    # Calculate RUL target
    eol_cycles = df_bat[df_bat['Discharge_Capacity_Ah'] <= eol_threshold]['Cycle_Index'].values
    if len(eol_cycles) > 0:
        eol_cycle = eol_cycles[0]
    else:
        eol_cycle = df_bat['Cycle_Index'].max()
        
    df_bat['RUL'] = np.maximum(0, eol_cycle - df_bat['Cycle_Index'])
    return df_bat

def run_pipeline(data_dir="nasa_raw_data/FY08Q4", output_dir="dataset_nasa"):
    """
    Executes end-to-end extraction across B0005, B0006, B0007, B0018
    and exports unscaled and standardized datasets.
    """
    os.makedirs(output_dir, exist_ok=True)
    batteries = ['B0005', 'B0006', 'B0007', 'B0018']
    
    print("=" * 70)
    print("NASA PCoE Battery Dataset Feature Extraction & Preprocessing Pipeline")
    print("=" * 70)
    
    dfs = []
    for bat_id in batteries:
        mat_path = os.path.join(data_dir, f"{bat_id}.mat")
        print(f"Processing cell: {bat_id} from {mat_path}...")
        df_b = extract_single_battery(mat_path, bat_id)
        print(f"  -> Extracted {len(df_b)} discharge cycles. Capacity range: {df_b['Discharge_Capacity_Ah'].min():.4f} - {df_b['Discharge_Capacity_Ah'].max():.4f} Ah")
        dfs.append(df_b)
        
    full_df = pd.concat(dfs, ignore_index=True)
    
    raw_csv_path = os.path.join(output_dir, "nasa_battery_raw_features.csv")
    full_df.to_csv(raw_csv_path, index=False)
    print(f"\n[OK] Unscaled Physical Features Saved: {raw_csv_path} (Shape: {full_df.shape})")
    
    # Create standardized dataset for ML
    feature_cols = [
        'Discharge_Capacity_Ah', 'SOH_Pct', 'Max_Discharge_Voltage_V', 'Min_Discharge_Voltage_V',
        'Mean_Discharge_Voltage_V', 'Mean_Discharge_Current_A', 'Max_Discharge_Temp_C',
        'Mean_Discharge_Temp_C', 'Discharge_Duration_s', 'Time_to_3_5V_s', 'Time_to_3_2V_s',
        'CC_Charge_Time_s', 'CV_Charge_Time_s', 'Total_Charge_Time_s', 'Max_Charge_Temp_C',
        'Electrolyte_Resistance_Re', 'Charge_Transfer_Resistance_Rct'
    ]
    
    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(full_df[feature_cols])
    scaled_df = pd.DataFrame(scaled_features, columns=feature_cols)
    scaled_df['Battery_ID'] = full_df['Battery_ID']
    scaled_df['Cycle_Index'] = full_df['Cycle_Index']
    scaled_df['RUL'] = full_df['RUL']
    
    # Reorder columns: metadata -> scaled features -> target RUL
    cols_order = ['Battery_ID', 'Cycle_Index'] + feature_cols + ['RUL']
    scaled_df = scaled_df[cols_order]
    
    scaled_csv_path = os.path.join(output_dir, "nasa_battery_standard_scaled.csv")
    scaled_df.to_csv(scaled_csv_path, index=False)
    print(f"[OK] Standard Scaled Features Saved:  {scaled_csv_path} (Shape: {scaled_df.shape})")
    
    print("\nData Integrity Summary:")
    print(f"Total Rows:     {len(scaled_df)}")
    print(f"Total Features: {len(feature_cols)}")
    print(f"Null Values:    {scaled_df.isnull().sum().sum()}")
    print(f"Duplicate Rows: {scaled_df.duplicated().sum()}")
    print("=" * 70)
    return full_df, scaled_df

if __name__ == "__main__":
    run_pipeline()
