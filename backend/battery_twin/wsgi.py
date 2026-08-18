"""
WSGI config for Battery Digital Twin project.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'battery_twin.settings')
application = get_wsgi_application()
