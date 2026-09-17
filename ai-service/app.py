"""
Digital Crime Scene Reconstruction System
Python Flask AI Microservice
NLP-powered witness analysis and contradiction detection
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import re
from nlp_engine import NLPEngine
from contradiction_detector import ContradictionDetector

app = Flask(__name__)
CORS(app)

nlp = NLPEngine()
detector = ContradictionDetector()


@app.route('/', methods=['GET'])
def health():
    return jsonify({
        "service": "Crime Scene AI Microservice",
        "status": "running",
        "version": "1.0.0",
        "endpoints": [
            "POST /analyze/statement",
            "POST /analyze/contradiction",
            "POST /insights/ranking"
        ]
    })


@app.route('/analyze/statement', methods=['POST'])
def analyze_statement():
    """
    Analyze a single witness statement using NLP.
    Extracts keywords, entities, timing clues, and flags suspicious patterns.
    
    Request body: { "statement": "...", "witnessId": 1 }
    """
    data = request.get_json()
    if not data or 'statement' not in data:
        return jsonify({"error": "statement field required"}), 400

    statement = data['statement']
    result = nlp.analyze(statement)

    return jsonify({
        "witnessId":        data.get("witnessId"),
        "keywords":         result["keywords"],
        "entities":         result["entities"],
        "timeMentions":     result["time_mentions"],
        "locationMentions": result["location_mentions"],
        "suspiciousFlags":  result["suspicious_flags"],
        "credibilityScore": result["credibility_score"],
        "sentimentPolarity": result["sentiment"],
        "wordCount":        len(statement.split())
    })


@app.route('/analyze/contradiction', methods=['POST'])
def analyze_contradiction():
    """
    Detect contradictions across multiple witness statements.
    
    Request body: {
        "statements": [
            { "witnessId": 1, "name": "Ramesh", "statement": "..." },
            { "witnessId": 2, "name": "Sunita", "statement": "..." }
        ]
    }
    """
    data = request.get_json()
    if not data or 'statements' not in data:
        return jsonify({"error": "statements array required"}), 400

    statements = data['statements']
    if len(statements) < 2:
        return jsonify({"error": "Need at least 2 statements to detect contradictions"}), 400

    contradictions = detector.detect(statements)

    return jsonify({
        "totalStatements": len(statements),
        "contradictions":  contradictions,
        "contradictionCount": len(contradictions),
        "overallConsistency": detector.consistency_score(statements)
    })


@app.route('/insights/ranking', methods=['POST'])
def suspect_ranking():
    """
    Generate a narrative AI ranking of suspects based on provided scores.
    
    Request body: {
        "suspects": [
            { "name": "Vikram", "probabilityScore": 78.5, "status": "SUSPECT" },
            ...
        ]
    }
    """
    data = request.get_json()
    suspects = data.get('suspects', [])

    if not suspects:
        return jsonify({"error": "suspects list required"}), 400

    # Sort by probability score
    ranked = sorted(suspects, key=lambda x: x.get('probabilityScore', 0), reverse=True)

    insights = []
    for i, s in enumerate(ranked):
        score = s.get('probabilityScore', 0)
        name = s.get('name', 'Unknown')

        if score >= 80:
            insight = f"⚠️ CRITICAL: {name} is the primary suspect with {score:.1f}% probability. Immediate action required."
        elif score >= 60:
            insight = f"🔴 HIGH RISK: {name} with {score:.1f}% probability requires urgent investigation."
        elif score >= 40:
            insight = f"🟡 MODERATE: {name} ({score:.1f}%) should remain under surveillance."
        elif score >= 20:
            insight = f"🟢 LOW: {name} ({score:.1f}%) is unlikely primary suspect but should not be cleared."
        else:
            insight = f"ℹ️ MINIMAL: {name} ({score:.1f}%) has insufficient evidence linking to crime."

        insights.append({
            "rank": i + 1,
            "suspect": name,
            "probabilityScore": score,
            "status": s.get('status'),
            "insight": insight
        })

    return jsonify({
        "ranking": insights,
        "primarySuspect": ranked[0]['name'] if ranked else None,
        "recommendation": generate_recommendation(ranked[0] if ranked else None)
    })


def generate_recommendation(top_suspect):
    if not top_suspect:
        return "Insufficient data for recommendations."
    score = top_suspect.get('probabilityScore', 0)
    name = top_suspect.get('name', 'Unknown')

    if score >= 70:
        return (f"Recommend immediate arrest warrant for {name}. "
                f"Evidence supports probable cause with {score:.1f}% confidence.")
    elif score >= 50:
        return (f"Recommend increased surveillance on {name}. "
                f"Conduct scene revisit and additional witness interviews.")
    else:
        return "Insufficient evidence. Recommend expanding investigation scope and re-examining all evidence."


if __name__ == '__main__':
    print("=" * 50)
    print("  Crime Scene AI Microservice")
    print("  Running on http://localhost:5000")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)
