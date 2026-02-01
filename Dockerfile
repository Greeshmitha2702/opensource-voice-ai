# Stage 1: Build frontend
FROM node:20 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend
FROM python:3.11-slim AS backend
WORKDIR /app
COPY backend/ ./backend/
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt


# Copy frontend build to backend static folder (so backend/app.py can serve it)
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Install a simple static server for frontend (e.g., serve)
RUN pip install fastapi uvicorn

# Expose ports
EXPOSE 8000

# Start backend (FastAPI) and serve frontend
# Render provides $PORT; default to 8000 for local/dev.
CMD ["sh", "-c", "uvicorn backend.app:app --host 0.0.0.0 --port ${PORT:-8000}"]
