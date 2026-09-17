package com.crimescene.algorithms;

import com.crimescene.models.Evidence;
import com.crimescene.models.Suspect;
import com.crimescene.models.TimelineEvent;
import com.crimescene.models.Witness;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * ============================================================
 * PROBABILITY SCORING ENGINE
 * ============================================================
 * Calculates a composite suspect probability score (0–100%)
 * using four weighted components:
 *
 *   Score = (W1 × Evidence Match)
 *         + (W2 × Location Proximity)
 *         + (W3 × Timeline Correlation)
 *         + (W4 × Suspicious Behavior)
 *
 * Default weights:
 *   W1 = 0.35 (Evidence Match)      — strongest indicator
 *   W2 = 0.25 (Location Proximity)  — physical placement matters
 *   W3 = 0.25 (Timeline Correlation)— alibi verification
 *   W4 = 0.15 (Behavior Score)      — background & behavior
 * ============================================================
 */
@Component
public class ProbabilityScorer {

    // Configurable weight constants
    private static final double W_EVIDENCE   = 0.35;
    private static final double W_PROXIMITY  = 0.25;
    private static final double W_TIMELINE   = 0.25;
    private static final double W_BEHAVIOR   = 0.15;

    /**
     * Main scoring method — calculates all sub-scores and composite probability.
     */
    public ScoreResult calculateScore(Suspect suspect,
                                      List<Evidence> caseEvidence,
                                      List<TimelineEvent> timeline,
                                      List<Witness> witnesses,
                                      double crimesceneLat,
                                      double crimesceneLng,
                                      LocalDateTime incidentTime) {

        double evidenceScore  = calculateEvidenceMatchScore(suspect, caseEvidence);
        double proximityScore = calculateProximityScore(suspect, crimesceneLat, crimesceneLng);
        double timelineScore  = calculateTimelineCorrelation(suspect, timeline, incidentTime);
        double behaviorScore  = calculateBehaviorScore(suspect, witnesses);

        // Composite weighted score (0-100)
        double composite = (W_EVIDENCE  * evidenceScore)
                         + (W_PROXIMITY * proximityScore)
                         + (W_TIMELINE  * timelineScore)
                         + (W_BEHAVIOR  * behaviorScore);

        // Clamp to [0, 100]
        composite = Math.min(100.0, Math.max(0.0, composite));

        return new ScoreResult(
            evidenceScore,
            proximityScore,
            timelineScore,
            behaviorScore,
            composite
        );
    }

    /**
     * COMPONENT 1: Evidence Match Score
     * Checks how much evidence in the case links to this suspect.
     * Each key evidence linkage gives a higher boost.
     */
    private double calculateEvidenceMatchScore(Suspect suspect, List<Evidence> evidence) {
        if (evidence == null || evidence.isEmpty()) return 20.0; // baseline uncertainty

        long total = evidence.size();
        long keyItems = evidence.stream().filter(e -> Boolean.TRUE.equals(e.getIsKeyEvidence())).count();

        // Check if suspect name appears in evidence descriptions/forensic notes
        long mentionCount = evidence.stream().filter(e -> {
            String lower = (e.getDescription() + " " + e.getForensicNotes()).toLowerCase();
            return suspect.getName() != null &&
                   lower.contains(suspect.getName().toLowerCase());
        }).count();

        double baseScore = (mentionCount / (double) total) * 100.0;

        // Key evidence multiplier
        if (keyItems > 0)  baseScore = Math.min(100, baseScore + (keyItems * 10));

        // Criminal record bonus
        if (suspect.getCriminalRecord() != null && !suspect.getCriminalRecord().isBlank()) {
            baseScore = Math.min(100, baseScore + 15);
        }

        return baseScore;
    }

    /**
     * COMPONENT 2: Location Proximity Score
     * Scores how close the suspect's last known location is to the crime scene.
     * Uses Haversine distance: within 0.5km = 100, > 10km = 0.
     */
    private double calculateProximityScore(Suspect suspect,
                                            double sceneLat, double sceneLng) {
        if (suspect.getLastSeenLatitude() == null || suspect.getLastSeenLongitude() == null) {
            return 30.0; // unknown location — partial score
        }

        double distKm = DijkstraAlgorithm.haversineDistance(
            suspect.getLastSeenLatitude(), suspect.getLastSeenLongitude(),
            sceneLat, sceneLng
        );

        // Score decays with distance
        if (distKm <= 0.5)  return 100.0;
        if (distKm <= 1.0)  return 90.0;
        if (distKm <= 2.0)  return 75.0;
        if (distKm <= 3.0)  return 60.0;
        if (distKm <= 5.0)  return 40.0;
        if (distKm <= 10.0) return 20.0;
        return 5.0;
    }

    /**
     * COMPONENT 3: Timeline Correlation Score
     * Checks how many timeline events occur near the suspect's last known time.
     * Suspects appearing in events DURING the crime get the highest score.
     */
    private double calculateTimelineCorrelation(Suspect suspect,
                                                List<TimelineEvent> timeline,
                                                LocalDateTime incidentTime) {
        if (timeline == null || timeline.isEmpty()) return 30.0;

        long duringEvents = timeline.stream()
            .filter(t -> t.getPhase() == TimelineEvent.Phase.DURING)
            .filter(t -> t.getRelatedSuspect() != null &&
                         t.getRelatedSuspect().getId().equals(suspect.getId()))
            .count();

        long beforeEvents = timeline.stream()
            .filter(t -> t.getPhase() == TimelineEvent.Phase.BEFORE)
            .filter(t -> t.getRelatedSuspect() != null &&
                         t.getRelatedSuspect().getId().equals(suspect.getId()))
            .count();

        // During events are most incriminating
        double score = (duringEvents * 30) + (beforeEvents * 10);

        // Check if suspect has verified alibi (AFTER events that confirm location elsewhere)
        long alibiEvents = timeline.stream()
            .filter(t -> t.getPhase() == TimelineEvent.Phase.AFTER && t.getIsVerified())
            .filter(t -> t.getRelatedSuspect() != null &&
                         t.getRelatedSuspect().getId().equals(suspect.getId()))
            .count();

        score = Math.max(0, score - (alibiEvents * 20));

        return Math.min(100, score > 0 ? score : 25.0);
    }

    /**
     * COMPONENT 4: Suspicious Behavior Score
     * Based on witness credibility scores and flagged suspicious behaviors.
     */
    private double calculateBehaviorScore(Suspect suspect, List<Witness> witnesses) {
        if (witnesses == null || witnesses.isEmpty()) return 20.0;

        // Check witness statements for suspect name mentions
        long mentionedCount = witnesses.stream().filter(w -> {
            if (w.getStatement() == null || suspect.getName() == null) return false;
            return w.getStatement().toLowerCase().contains(suspect.getName().toLowerCase()) ||
                   (suspect.getAlias() != null &&
                    w.getStatement().toLowerCase().contains(suspect.getAlias().toLowerCase()));
        }).count();

        // Average credibility of mentioning witnesses
        double avgCredibility = witnesses.stream()
            .filter(w -> w.getCredibilityScore() != null)
            .mapToDouble(Witness::getCredibilityScore)
            .average()
            .orElse(50.0);

        double score = mentionedCount > 0
            ? (mentionedCount / (double) witnesses.size()) * avgCredibility
            : 15.0;

        // Boost if suspect has known criminal record
        if (suspect.getCriminalRecord() != null &&
            !suspect.getCriminalRecord().isBlank() &&
            suspect.getCriminalRecord().length() > 20) {
            score = Math.min(100, score + 20);
        }

        return Math.min(100, score);
    }

    /**
     * Result container for all scoring components
     */
    public record ScoreResult(
        double evidenceMatchScore,
        double proximityScore,
        double timelineScore,
        double behaviorScore,
        double compositeScore
    ) {
        public String getRiskLevel() {
            if (compositeScore >= 80) return "CRITICAL";
            if (compositeScore >= 60) return "HIGH";
            if (compositeScore >= 40) return "MEDIUM";
            if (compositeScore >= 20) return "LOW";
            return "MINIMAL";
        }
    }
}
