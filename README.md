Open-Source Real-Time Voice AI Platform

A full-stack, web-based real-time Text-to-Speech (TTS) application built using open-source and freely available models.  
Users can generate expressive, multilingual voice output in real time by providing text input and controlling voice parameters such as emotion, pitch, and speed.

This system is intended strictly for voice generation and experimentation.  
Evaluation, scoring, sentiment analysis, or decision-making based on generated speech is intentionally out of scope.

---

Python | React | Docker | MIT License

---

## Features

### User Features
- Real-time text-to-speech generation  
- Browser-based audio playback (no external applications required)  
- Emotion and speaking style control  
- Pitch and speech speed adjustment  
- Multilingual voice generation  
- Optional voice cloning using recorded or uploaded samples  
- One-click voice generation  
- Responsive user interface (desktop, tablet, and mobile)  

---

### System Features
- Low-latency audio streaming  
- Open-source TTS models (no paid or proprietary APIs)  
- REST-based frontend–backend communication  
- Dockerized local deployment  
- Cloud-deployed demo for easy access  
- Modular and extensible architecture  

---

## Security and Design Principles
- No user profiling or behavioral analysis  
- No scoring, ranking, or evaluation logic  
- Controlled file uploads for voice samples  
- Secure API communication  
- Environment-based configuration for secrets  

---

## Explicitly Out of Scope
- Voice quality evaluation or scoring  
- Emotion or sentiment detection  
- User ranking or recommendations  
- Hiring, selection, or decision-making logic  
- Proprietary or paid TTS APIs  

---

## How the Application Works

1. User opens the web application.  
2. Clicks **Get Started** on the landing page.  
3. Enters text to be converted into speech.  
4. Selects language or linguistic persona.  
5. Chooses emotion or speaking style.  
6. Adjusts pitch and speech speed.  
7. Optionally records or uploads a voice sample.  
8. Clicks **Generate Voice**.  
9. Audio is synthesized and played in real time in the browser.  

---

## Live Deployment

Live Web Application:  
https://opensource-voice-ai.onrender.com/

---

## Quick Start (Local Development)

This project can be run locally using **manual setup (recommended for development)** or **Docker (recommended for full-stack testing)**.

---

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm
- Docker and Docker Compose
- Modern web browser (Chrome, Firefox, Edge, Safari)

---

## Option 1: Run Locally (Manual Setup)

### Step 1: Clone the Repository
```bash
git clone https://github.com/Greeshmitha2702/opensource-voice-ai.git
cd opensource-voice-ai
Step 2: Run the Backend (Flask API)

Open a terminal and navigate to the backend folder:

cd backend


Install Python dependencies:

pip install -r requirements.txt


Start the backend server:

python -m uvicorn app:app --reload


Backend will be available at:

http://127.0.0.1:8000


 Keep this terminal running.

Step 3: Run the Frontend (React + Vite)

Open a new terminal and navigate to the frontend folder:

cd frontend


Install frontend dependencies (first time only):

npm install


Start the frontend development server:

npm run dev


Frontend will be available at:

http://localhost:5173/

Output (Manual Setup)

Backend API: http://127.0.0.1:8000

Frontend UI: http://localhost:5173/

Users can now generate voice in real time from the browser interface.

Option 2: Run Using Docker (Full Stack)

Docker provides a fully containerized setup for consistent execution.

From the project root directory:

docker-compose build
docker-compose up


Docker will start both frontend and backend services automatically.

Output (Docker Setup)

Frontend and backend services run inside containers

Application is accessible once containers are running successfully

Notes

Manual setup is recommended for development and debugging.

Docker setup is recommended for demonstrations, testing, and evaluation.

Ensure backend is running before triggering voice generation from the frontend.
