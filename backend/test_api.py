"""
Automated Backend API Verification Suite
"""
import os
import sys
import json
import django
from django.test import RequestFactory

# Setup Django environment
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'battery_twin.settings')
django.setup()

from api.views import (
    HealthCheckView,
    ModelBenchmarkView,
    FeatureImportanceView,
    PredictRULView,
    PredictTrajectoryView,
    TelemetryCellsListView,
    TelemetryCellDetailView,
    DigitalTwinSimulateView,
    DigitalTwinWhatIfView,
    ReportSummaryView
)

rf = RequestFactory()

def test_endpoint(name, view_func, request, **kwargs):
    try:
        response = view_func(request, **kwargs)
        status_code = response.status_code
        data = response.data
        print(f"[{'PASS' if status_code == 200 else 'FAIL'}] {name} -> Status: {status_code}")
        return status_code == 200
    except Exception as e:
        print(f"[ERROR] {name} -> Exception: {e}")
        return False

print("=" * 60)
print("Running Django REST API Endpoint Automated Verification")
print("=" * 60)

results = []

# 1. Health
req = rf.get('/api/health/')
results.append(test_endpoint('GET /api/health/', HealthCheckView.as_view(), req))

# 2. Benchmark (NASA & Operational)
req = rf.get('/api/models/benchmark/?dataset=nasa')
results.append(test_endpoint('GET /api/models/benchmark/?dataset=nasa', ModelBenchmarkView.as_view(), req))

req = rf.get('/api/models/benchmark/?dataset=operational')
results.append(test_endpoint('GET /api/models/benchmark/?dataset=operational', ModelBenchmarkView.as_view(), req))

# 3. Feature Importance
req = rf.get('/api/models/feature-importance/?dataset=nasa')
results.append(test_endpoint('GET /api/models/feature-importance/', FeatureImportanceView.as_view(), req))

# 4. Predict RUL
payload = {
    'dataset': 'nasa',
    'model_name': 'XGBoost',
    'features': {
        'Discharge_Capacity_Ah': 1.85,
        'SOH_Pct': 92.5,
        'Max_Discharge_Voltage_V': 4.18,
        'Min_Discharge_Voltage_V': 2.70,
        'Mean_Discharge_Voltage_V': 3.52,
        'Mean_Discharge_Current_A': 1.95,
        'Max_Discharge_Temp_C': 36.5,
        'Mean_Discharge_Temp_C': 32.1,
        'Discharge_Duration_s': 3350,
        'Time_to_3_5V_s': 2100,
        'Time_to_3_2V_s': 2850,
        'CC_Charge_Time_s': 3100,
        'CV_Charge_Time_s': 2200,
        'Total_Charge_Time_s': 5300,
        'Max_Charge_Temp_C': 27.5,
        'Electrolyte_Resistance_Re': 0.055,
        'Charge_Transfer_Resistance_Rct': 0.075
    }
}
req = rf.post('/api/predict/rul/', data=json.dumps(payload), content_type='application/json')
results.append(test_endpoint('POST /api/predict/rul/', PredictRULView.as_view(), req))

# 5. Predict Trajectory
req = rf.post('/api/predict/trajectory/', data=json.dumps({'current_cycle': 30, 'current_capacity': 1.84}), content_type='application/json')
results.append(test_endpoint('POST /api/predict/trajectory/', PredictTrajectoryView.as_view(), req))

# 6. Cells List & Detail
req = rf.get('/api/telemetry/cells/')
results.append(test_endpoint('GET /api/telemetry/cells/', TelemetryCellsListView.as_view(), req))

req = rf.get('/api/telemetry/cell/B0005/')
results.append(test_endpoint('GET /api/telemetry/cell/B0005/', TelemetryCellDetailView.as_view(), req, cell_id='B0005'))

# 7. Digital Twin Simulate & What-If
req = rf.post('/api/digital-twin/simulate/', data=json.dumps({'cycle_index': 15, 'soc_pct': 75.0}), content_type='application/json')
results.append(test_endpoint('POST /api/digital-twin/simulate/', DigitalTwinSimulateView.as_view(), req))

req = rf.post('/api/digital-twin/what-if/', data=json.dumps({'test_temp': 45.0, 'test_c_rate': 2.5}), content_type='application/json')
results.append(test_endpoint('POST /api/digital-twin/what-if/', DigitalTwinWhatIfView.as_view(), req))

# 8. Report Summary
req = rf.get('/api/reports/summary/')
results.append(test_endpoint('GET /api/reports/summary/', ReportSummaryView.as_view(), req))

print("=" * 60)
print(f"Total Tests: {len(results)} | Passed: {sum(results)} | Failed: {len(results) - sum(results)}")
print("=" * 60)

if all(results):
    print("ALL API ENDPOINTS FUNCTIONING PERFECTLY!")
    sys.exit(0)
else:
    sys.exit(1)
