# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Production Django + ML Runtime
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python ML & Django dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code, ML engine, and datasets
COPY backend/ ./backend/
COPY ml_engine/ ./ml_engine/
COPY dataset_nasa/ ./dataset_nasa/
COPY standard_scaled_dataset.csv ./

# Copy built frontend assets to static serving directory
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=battery_twin.settings
ENV DJANGO_DEBUG=False
ENV PORT=8000

WORKDIR /app/backend

# Collect static files with whitenoise and run migrations
RUN python manage.py collectstatic --noinput

EXPOSE 8000

# Start production WSGI server
CMD ["gunicorn", "battery_twin.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120"]
