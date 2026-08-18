"""
Root URL Configuration for Battery Digital Twin
"""

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def root_api_index(request):
    return JsonResponse({
        'service': 'Battery Remaining Useful Life (RUL) & Digital Twin API',
        'version': '2.0.0',
        'status': 'Operational',
        'endpoints': {
            'health': '/api/health/',
            'benchmark': '/api/models/benchmark/',
            'feature_importance': '/api/models/feature-importance/',
            'predict_rul': '/api/predict/rul/',
            'predict_trajectory': '/api/predict/trajectory/',
            'cells_list': '/api/telemetry/cells/',
            'cell_detail': '/api/telemetry/cell/<cell_id>/',
            'digital_twin_simulate': '/api/digital-twin/simulate/',
            'digital_twin_what_if': '/api/digital-twin/what-if/',
            'upload_csv': '/api/data/upload-csv/',
            'report_summary': '/api/reports/summary/'
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', root_api_index, name='root_index'),
    path('api/', include('api.urls')),
]
