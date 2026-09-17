# Algorithms & AI Concepts

The Digital Crime Scene Reconstruction System implements several core algorithms for suspect profiling and behavior mapping.

## 1. Path Prediction (Dijkstra & A* Algorithms)
**Location:** `backend/src/main/java/com/crimescene/algorithms/`

Used to predict a suspect's escape route from the crime scene.

- **Graph Construction:** Locations (Crime Scene, Checkpoints, Exits) are treated as nodes. Distances between nodes are calculated using the **Haversine Formula** (great-circle distance between two points on a sphere).
- **Dijkstra:** Explores all possible paths to find the absolute shortest physical route to the suspected escape destination.
- **A* (A-Star):** Uses a heuristic (straight-line distance to goal) to find the optimal path much faster in complex urban environments.

## 2. Suspect Probability Scoring Engine
**Location:** `backend/src/main/java/com/crimescene/algorithms/ProbabilityScorer.java`

A weighted scoring system (0-100) determining the likelihood of a suspect's involvement. It combines 4 factors:

1. **Evidence Match (35% weight):** Keyword overlap between evidence forensics and suspect profile. Boosted by 'Key Evidence' tags.
2. **Location Proximity (25% weight):** Decay function based on Haversine distance between suspect's last known location and the crime scene.
3. **Timeline Correlation (25% weight):** Cross-references suspect's recorded movements against timeline `DURING` the incident window. Alibis (`AFTER` verified events) reduce the score.
4. **Behavior Score (15% weight):** Extracted from witness testimonies mentioning the suspect, factored by the witness's individual credibility.

## 3. Witness Contradiction Detector (AI Microservice)
**Location:** `ai-service/contradiction_detector.py`

- **Inter-statement Analysis:** Uses regex pattern pairings to find structural contradictions between multiple witnesses (e.g., Witness A says the suspect was "alone", Witness B uses plural pronouns "they/them").
- **Time Discrepancy Parsing:** Extracts explicit time mentions (e.g., "10:30 PM") and flags if witnesses report conflicting times.

## 4. NLP Statement Analysis
**Location:** `ai-service/nlp_engine.py`
- Uses **spaCy** Named Entity Recognition (NER) to plot `PERSON`, `TIME`, and `LOCATION` references.
- Checks witness confidence (hedging words like 'maybe', 'I think') to auto-calculate a baseline **Credibility Score** (0-100).
