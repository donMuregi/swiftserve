import os
import sys

# Add the backend directory to Python path
# Adjust this path to match your cPanel deployment directory
sys.path.insert(0, os.path.dirname(__file__))

os.environ['DJANGO_SETTINGS_MODULE'] = 'swiftcar_api.settings'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
