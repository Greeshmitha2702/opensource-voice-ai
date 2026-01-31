
## Open-Source Real-Time Voice AI Platform

A full-stack, web-based real-time Text-to-Speech (TTS) application built using open-source and freely available models.  
The platform enables expressive, multilingual voice generation with real-time audio playback through a modern web interface.

This system is designed strictly for voice generation and experimentation.  
Evaluation, scoring, sentiment analysis, or decision-making based on generated speech is intentionally out of scope.

Python | React | Docker | MongoDB

---

## Objective

To build a real-time voice AI platform that demonstrates the capabilities of open-source text-to-speech systems without relying on paid or proprietary APIs.

The application aims to:
- Generate natural-sounding speech in real time
- Support multilingual and expressive voice output
- Allow control over emotion, pitch, and speed
- Run locally and in containers using Docker
- Remain fully open-source and vendor-independent

---

## Features

### User Features
- Real-time text-to-speech generation
- Browser-based audio playback
- Emotion and speaking style control
- Pitch and speech speed adjustment
- Multilingual voice generation
- Optional voice cloning using short voice samples
- One-click voice generation
- Responsive interface for desktop and mobile devices

### System Features
- Low-latency audio streaming
- Open-source TTS models
- REST-based frontend–backend communication
- Dockerized local deployment
- Cloud-hosted live demo
- Modular and extensible architecture

---

## Security and Design Principles

- No user profiling or behavioral analysis
- No scoring, ranking, or evaluation logic
- No sentiment or emotion detection
- Controlled file uploads for voice samples
- Secure API communication
- Configuration managed through environment variables

---


## Explicitly Out of Scope

- Voice quality evaluation or scoring
- Emotion or sentiment analysis
- User ranking or recommendations
- Hiring, selection, or decision-making logic
- Paid or proprietary text-to-speech APIs

---

## System Architecture

### Frontend
- Built using React and TypeScript
- Provides user interface for text input and voice controls
- Handles real-time audio playback in the browser

### Backend
- Python Flask application
- Handles text-to-speech requests
- Streams generated audio back to the frontend

### Text-to-Speech Engine
- Open-source and freely available TTS models
- Runs locally without external API dependency

### Deployment
- Docker and Docker Compose for containerized execution
- Supports both local development and cloud deployment

---

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- HTML5 and CSS3
- Web Audio API
- ESLint

### Backend
- Python
- Flask
- RESTful APIs

### Text-to-Speech
- Open-source TTS models
- Real-time audio generation and streaming

### Containerization and Tooling
- Docker
- Docker Compose
- Node.js and npm
- Environment variables using `.env`
- Git and GitHub

---

## Project Structure



```text
opensource-voice-ai/
│
├── backend/
│   ├── app.py                # Main API entry
│   ├── requirements.txt
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── tts.py            # TTS endpoint (core logic)
│   │   ├── translate.py      # Translation logic
│   │   └── history.py        # MongoDB history
│   │
│   └── __pycache__/
│
├── frontend/
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   │
│   ├── public/
│   │
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── index.css
│   │
│   │   ├── components/
│   │   │   └── AudioVisualizer.tsx
│   │   │
│   │   ├── services/
│   │   │   └── ttsService.ts   # API calls only
│   │   │
│   │   ├── assets/
│   │   └── types.ts
│
├── docker-compose.yml
├── Dockerfile
├── .env
├── README.md
└── .gitignore

```

---
## Inputs
- Text input

- Language or linguistic persona selection

- Emotion or speaking style

- Pitch control

- Speed control

- Optional voice sample (recorded or uploaded)
---
## Outputs

- Real-time streaming audio playback  
- Downloadable audio file  
- Displayed latency statistics  
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

This project can be run locally using **deployed application** or **manual setup (recommended for full-stack testing)** 

---

### Prerequisites
- Python 3.12+
- Node.js 22+
- npm
- Docker and Docker Compose
- Modern web browser (Chrome, Firefox, Edge, Safari)

---
## Option 1: Use the Deployed Application (Recommended)

This option allows you to directly use the application without any local setup.

Live Application URL:
https://opensource-voice-ai.onrender.com/
---
## Option 2: Run Locally (Manual Setup)
### Step 1: Clone the Repository
```bash
git clone https://github.com/Greeshmitha2702/opensource-voice-ai.git
```
- Open a terminal and navigate to opensource-voice-ai:
```bash
cd opensource-voice-ai
```
### Step 2: Run the Backend (Flask API)
- Open a terminal and navigate to the backend folder:

```bash
cd backend
```

- Install Python dependencies:
```bash
pip install -r requirements.txt
```
- Start the backend server:
```bash
python -m uvicorn app:app --reload
```

- Backend will be available at:
```bash
http://127.0.0.1:8000
```

- Keep this terminal running.

### Step 3: Run the Frontend (React + Vite)
- Open a new terminal and navigate to the frontend folder:
```bash
cd frontend
```

- Install frontend dependencies (first time only):
```bash
npm install
```

- Start the frontend development server:
```bash
npm run dev
```

- Frontend will be available at:
```bash
http://localhost:5173/
```
### Step 4: Run Using Docker (Recommended for Correct Full Output)
Docker provides a fully containerized setup that runs both frontend and backend together and ensures consistent behavior.

From the project root directory:
```bash
docker-compose build
docker-compose up
```
- Docker will start both frontend and backend services automatically.

Output (Docker Setup)

- Frontend and backend services run inside containers

- Application is accessible once containers are running successfully
### Output (Local and Docker Setup)

- Backend API: http://127.0.0.1:8000

- Frontend UI: http://localhost:5173/

- Docker setup ensures correct and complete full-stack output.

---

## API Endpoints

### 1. Generate Text-to-Speech

**Endpoint:**  
`POST /api/tts`

 
Generates real-time text-to-speech audio based on the provided text and voice configuration.

**Request Body (JSON):**
- `text` (string) – Input text to be converted into speech  
- `voice` (string) – Voice persona (e.g., "Karthik")  
- `emotion` (string) – Speaking style or emotion (e.g., "Neutral", "Cheerful")  
- `speed` (number) – Speech speed multiplier (e.g., `1.0`)  
- `pitch` (number) – Pitch adjustment value  

**Response:**  
- Audio stream (`audio/mpeg`) returned as synthesized speech  

---

### 2. Get Voice Generation History

**Endpoint:**  
`GET /api/history`

 
Fetches the most recent voice synthesis history entries.

**Response (JSON):**
- `history` – Array of history objects (see schema below)

---

### 3. Save Voice Metadata

**Endpoint:**  
`POST /api/history`

 
Stores metadata related to a generated or uploaded voice sample.  
Audio files themselves are **not stored in the database**.

**Request Type:**  
`multipart/form-data`

**Form Fields:**
- `file` – Recorded or uploaded audio file  
- `text` (string) – Input text or optional transcription  
- `voice` (string) – Voice persona  
- `emotion` (string) – Emotion or style label  
- `pitch` (number) – Pitch value  
- `speed` (number) – Speed value  

**Response (JSON):**
```json
{
  "status": "ok"
}
```
## Database Schema
Voice History Collection (MongoDB)

Only metadata is stored in the database.
Audio files are handled separately.

Each document follows the structure below:

```json{
  "_id": "ObjectId",
  "text": "string",
  "voice": "string",
  "emotion": "string",
  "pitch": "number",
  "speed": "number",
  "timestamp": "ISODate"
}
```
## Field Description:

- text – Input text or transcription label

- voice – Selected voice persona

- emotion – Emotion or speaking style

- pitch – Pitch adjustment value

- speed – Speech speed multiplier

- timestamp – Time of creation

## Edge Cases and Limitations

### Positive Edge Cases
- Short and medium-length text inputs generate speech with low latency
- Emotion, pitch, and speed controls are reflected accurately in output audio
- Multilingual text inputs work correctly for supported languages
- Browser-based audio playback works without additional plugins
- Dockerized setup provides consistent behavior across environments

### Negative Edge Cases
- Very long text inputs may increase processing time and latency
- Large TTS models may cause memory issues on low-resource systems
- First request after backend inactivity may experience cold-start delay
- Voice cloning quality depends on clarity and duration of sample audio
- High concurrent requests may reduce real-time performance
- Network interruptions can affect audio streaming

---

## Future Enhancements

- Chunk-based processing for long text inputs
- Model optimization for faster inference and lower memory usage
- Improved concurrency handling for multiple users
- Enhanced error handling and user feedback
- Expanded language and voice persona support
- Optional offline-only mode
- Audio caching for repeated requests
- User authentication for personalized voice history

---

## Contributing

Contributions are welcome.

You may:
- Submit pull requests for improvements or new features
- Open issues to report bugs or suggest enhancements

Please ensure contributions follow the existing project structure and coding standards.

---

## Authors

- **Afreen Dudekula**
- **Bingumala Lakshmi Greeshmitha**

---

## License

This project is licensed under the **MIT License**.  
See the `LICENSE` file for complete details.

---

## Acknowledgments

- Open-source Text-to-Speech research community
- Flask framework and community
- React and Vite ecosystem
- Web Audio API
- Docker and open-source container tooling

---




