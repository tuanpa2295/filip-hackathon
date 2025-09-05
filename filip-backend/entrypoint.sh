#!/usr/bin/bash

set -e

echo ">>> Running Django migrations..."
poetry run python manage.py migrate

echo ">>> Collect static files..."
poetry run python manage.py collectstatic --noinput

echo ">>> Starting Django server..."
poetry run python manage.py runserver 0.0.0.0:8000
