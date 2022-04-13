import os

import celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = celery.Celery("meals")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
