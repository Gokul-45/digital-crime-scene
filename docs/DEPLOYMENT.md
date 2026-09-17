# Deployment Guide

For a production deployment (e.g., AWS, Heroku, or DigitalOcean), follow these steps:

## 1. Database (PostgreSQL)
1. Install PostgreSQL.
2. Create a database `crime_scene_db`.
3. In `backend/src/main/resources/application.properties`:
   - Comment out the H2 settings.
   - Uncomment the PostgreSQL settings and supply your credentials.

## 2. Java Backend
Compile the Spring Boot application into a `.jar`:
```bash
cd backend
mvn clean package -DskipTests
```
Run the JAR:
```bash
java -jar target/digital-crime-scene-1.0.0.jar
```

## 3. Python AI Microservice
Use `gunicorn` for a production WSGI server instead of Flask's built-in server:
```bash
cd ai-service
pip install -r requirements.txt gunicorn
python -m spacy download en_core_web_sm
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 4. React Frontend
Build static frontend files:
```bash
cd frontend
npm install
npm run build
```
Deploy the `dist/` folder using Nginx, Vercel, or Netlify. Ensure API requests to `/api` are proxy-passed to your Spring Boot application (port `8080`).
