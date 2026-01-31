# Open-Source Real-Time Voice AI Platform

A full-stack, web-based real-time Text-to-Speech (TTS) application built using high-performance open-source models. This platform allows users to generate expressive, multilingual voice output in real-time with granular control over vocal characteristics.

---

## 🚀 Live Deployment
**Application URL:** [https://opensource-voice-ai.onrender.com/](https://opensource-voice-ai.onrender.com/)

---

## 🛠 Tech Stack
* **Frontend:** React, TypeScript, Vite, Web Audio API
* **Backend:** Python, FastAPI, Uvicorn
* **Infrastructure:** Docker, Docker Compose
* **Deployment:** Render
* **License:** MIT

---

## ✨ Features

### User Experience
* **Real-Time Synthesis:** Low-latency text-to-speech generation.
* **In-Browser Playback:** Native audio handling without external plugins.
* **Vocal Customization:** Adjust emotion, speaking style, pitch, and speed.
* **Voice Cloning:** Upload or record samples for personalized synthesis.
* **Responsive Design:** Fully optimized for Desktop, Tablet, and Mobile.

### System Capabilities
* **Open-Source Core:** No reliance on paid or proprietary third-party APIs.
* **Containerized Workflow:** Fully Dockerized for "one-click" local deployment.
* **Modular Architecture:** Easy to swap or add new TTS models.

---

## 📂 Project Structure

```text
opensource-voice-ai/
├── backend/
│   ├── routes/             # API endpoint definitions
│   ├── app.py              # Main application entry point
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── services/       # API communication (ttsService.ts)
│   │   └── types/          # TypeScript interfaces
│   ├── package.json        # Node.js dependencies
│   └── vite.config.ts      # Vite configuration
├── docker-compose.yml      # Multi-container orchestration
├── Dockerfile              # Container build instructions
└── .env                    # Environment configuration
⚙️ Quick Start
Option 1: Docker (Recommended)
Bash
# Clone the repository
git clone [https://github.com/Greeshmitha2702/opensource-voice-ai.git](https://github.com/Greeshmitha2702/opensource-voice-ai.git)
cd opensource-voice-ai

# Build and run
docker-compose up --build
Frontend: http://localhost:5173

Backend: http://localhost:8000

Option 2: Manual Setup
1. Backend:

Bash
cd backend
pip install -r requirements.txt
python -m uvicorn app:app --reload
2. Frontend:

Bash
cd frontend
npm install
npm run dev
🛡 Security & Design Principles
Privacy-First: No user profiling or behavioral tracking.

Data Integrity: Controlled file uploads for voice samples.

Strict Scope: The system does not perform emotion detection or automated user ranking.

🤝 Contributors
Developed by Afreen Dudekula and Bingumala Lakshmi Greeshmitha under the guidance of Coriolosis.

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.


---

### 2. Dockerfile
Create a file named `Dockerfile` in your root folder. This allows others to build your app easily.

```dockerfile
# Use Python base image for Backend
FROM python:3.10-slim as backend-build
WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .

# Use Node base image for Frontend
FROM node:18-slim as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Final stage to run both (simplified for demo)
FROM python:3.10-slim
WORKDIR /app
COPY --from=backend-build /app/backend /app/backend
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

EXPOSE 8000
CMD ["python", "-m", "uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8000"]
3. docker-compose.yml
Create a file named docker-compose.yml in your root folder.

YAML
version: '3.8'
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app/backend
    environment:
      - ENV=development

  frontend:
    image: node:18-slim
    working_dir: /app/frontend
    volumes:
      - ./frontend:/app/frontend
    ports:
      - "5173:5173"
    command: npm run dev