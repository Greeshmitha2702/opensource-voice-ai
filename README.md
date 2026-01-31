# Open-Source Real-Time Voice AI Platform

A Dockerized, web-based real-time Text-to-Speech (TTS) platform built using open-source and freely available models. The application enables expressive, multilingual voice generation with real-time audio streaming, without relying on paid or proprietary APIs.

---

## Problem Statement

Most existing voice AI solutions depend on closed and expensive APIs, limiting accessibility, flexibility, and customization. These constraints prevent students and developers from building scalable real-time voice applications without vendor lock-in.

Recent advancements in open-source text-to-speech models make it possible to build low-latency, high-quality voice systems that can run locally and remain fully open.

---

## Objective

The goal of this project is to develop a real-time voice AI application that:

- Uses only open-source or freely available text-to-speech models
- Supports real-time audio streaming
- Enables expressive and multilingual speech generation
- Runs completely inside Docker
- Avoids all paid or proprietary APIs

---

## Features

### Text-to-Speech
- Converts text into natural-sounding speech  
- Supports real-time streaming audio playback  
- Allows generated audio to be downloaded  

### Voice and Emotion Control
- Optional voice cloning using short audio samples  
- Emotion or speaking style control through prompts  
- Adjustable speech speed and tone  

### Multilingual Support
- Speech generation in multiple languages  
- Language selection through the web interface  

### Performance Metrics
- Displays latency metrics to evaluate real-time performance  

---

## Inputs

- Text input  
- Optional voice sample for voice cloning  
- Language selection  
- Emotion or speaking style prompt  
- Speech speed or tone controls  

---

## Outputs

- Real-time streaming audio playback  
- Downloadable audio file  
- Displayed latency statistics  

---

## System Architecture

- **Frontend:** React and TypeScript application for user interaction, audio playback, and visualization  
- **Backend:** Python Flask server handling text-to-speech requests and streaming audio responses  
- **TTS Engine:** Open-source text-to-speech models running locally  
- **Deployment:** Docker and Docker Compose for containerized execution  

---

## Tech Stack

### Frontend
- React  
- TypeScript  
- Vite  
- HTML5 and CSS3  
- Web Audio API  

### Backend
- Python  
- Flask  
- RESTful APIs  

### Text-to-Speech
- Open-source and freely available TTS models  
- Real-time audio generation and streaming  

### Containerization
- Docker  
- Docker Compose  

---

## Docker Deployment

The application is fully containerized to ensure reproducibility and ease of deployment.

### Run the Application
```bash
docker-compose up --build

Use Cases

Real-time voice assistants

Content narration and audiobooks

Multilingual dubbing

Accessibility solutions

Privacy-focused or offline voice applications

Expected Outcome

A fully Dockerized real-time voice AI application demonstrating the capabilities of open-source text-to-speech technologies. The platform is suitable for live assistants, narration, dubbing, and accessibility-focused use cases.

Team and Acknowledgement

This project was developed by Afreen Dudekula and Bingumala Lakshmi Greeshmitha under the guidance and support of Coriolis Technologies Internship.

Contribution

Contributions are welcome. Please fork the repository and submit a pull request for review.