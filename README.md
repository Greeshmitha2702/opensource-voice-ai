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

### Prerequisites
- Docker  
- Docker Compose  
- Modern web browser (Chrome, Firefox, Edge, Safari)  

### Run Locally
```bash
docker-compose up --build
