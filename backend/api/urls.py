"""
API URL Routing
"""

from django.urls import path
from .views import (
    HealthCheckView,
    ModelBenchmarkView,
    FeatureImportanceView,
    PredictRULView,
    PredictTrajectoryView,
    TelemetryCellsListView,
    TelemetryCellDetailView,
    DigitalTwinSimulateView,
    DigitalTwinWhatIfView,
    BatchUploadCSVView,
    ReportSummaryView
)

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='health_check'),
    path('models/benchmark/', ModelBenchmarkView.as_view(), name='model_benchmark'),
    path('models/feature-importance/', FeatureImportanceView.as_view(), name='feature_importance'),
    path('predict/rul/', PredictRULView.as_view(), name='predict_rul'),
    path('predict/trajectory/', PredictTrajectoryView.as_view(), name='predict_trajectory'),
    path('telemetry/cells/', TelemetryCellsListView.as_view(), name='telemetry_cells_list'),
    path('telemetry/cell/<str:cell_id>/', TelemetryCellDetailView.as_view(), name='telemetry_cell_detail'),
    path('digital-twin/simulate/', DigitalTwinSimulateView.as_view(), name='digital_twin_simulate'),
    path('digital-twin/what-if/', DigitalTwinWhatIfView.as_view(), name='digital_twin_what_if'),
    path('data/upload-csv/', BatchUploadCSVView.as_view(), name='upload_csv'),
    path('reports/summary/', ReportSummaryView.as_view(), name='report_summary'),
]
