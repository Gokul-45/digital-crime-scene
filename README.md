# 🚀 Digital Crime Scene Reconstruction System

![Java](https://img.shields.io/badge/Java-17-orange) ![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.0-green) ![React](https://img.shields.io/badge/React-18-blue) ![Python](https://img.shields.io/badge/Python-3.9+-yellow)

A full-stack, AI-powered forensic investigation assistant designed to help reconstruct digital crime scenes using witness statements, evidence data, suspect movement prediction, and AI.

---

## 🌟 Key Features

1. **Dashboard:** Interactive statistics, charts, and priority-based active cases overview.
2. **Case Management:** Full reporting and tracking of crime scenes.
3. **Evidence Repository:** Track physical and digital evidence with a 'chain of custody'.
4. **Witness Statement Analyzer:** NLP-powered extraction of keywords, time, locations, and contradictions.
5. **Suspect Path Prediction:** Uses Dijkstra and A* pathfinding algorithms over location graphs to predict suspect escape routes.
6. **Crime Timeline Reconstruction:** Auto-generates a chronological events timeline (Before / During / After incident) from case data.
7. **Probability Scoring Engine:** Multi-factor suspect scoring using evidence correlation, location proximity, behavior, and timeline matching.
8. **AI Insights Generator:** Automatic anomaly and inconsistency detection alerts.
9. **PDF Reports:** Single-click comprehensive case report downloading.

---

## 🗺️ System Architecture

- **Frontend:** React + Tailwind CSS + Vite + Recharts
- **Backend:** Java Spring Boot + Spring Security JWT + JPA / Hibernate
- **Database:** H2 In-Memory (Configured) or PostgreSQL
- **AI Microservice:** Python + Flask + spaCy

---

## 🛠️ Quick Start Guide (Local Development)

### 1. Start the Java Backend (Spring Boot)
Requires JDK 17+ and Maven.
```bash
cd backend
mvn spring-boot:run
```
*Note: The backend is preconfigured to use an H2 in-memory database with sample data. No PostgreSQL installation is required for demo purposes.*

### 2. Start the AI Microservice (Python)
Requires Python 3.9+.
```bash
cd ai-service
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python app.py
```
*Note: If the Python service isn't running, the Java backend has a built-in fallback NLP analyzer that will trigger automatically!*

### 3. Start the Frontend (React)
Requires Node.js 18+.
```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Demo Credentials

Navigate to `http://localhost:3000` to log in.

- **Admin/Commander:** `admin` / `password123`
- **Lead Investigator:** `det_sharma` / `password123`
- **Forensic Analyst:** `analyst_ak` / `password123`

---

## 📚 Documentation Links
- [Algorithms Overview](docs/ALGORITHMS.md)
- [API Reference](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
