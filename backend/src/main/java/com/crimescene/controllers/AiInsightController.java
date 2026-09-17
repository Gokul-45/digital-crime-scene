package com.crimescene.controllers;

import com.crimescene.models.*;
import com.crimescene.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * AI Insights Controller — generate and manage AI-powered investigation alerts
 */
@RestController
@RequestMapping("/api/insights")
@RequiredArgsConstructor
@CrossOrigin
public class AiInsightController {

    private final AiInsightRepository aiInsightRepository;
    private final CaseRepository caseRepository;
    private final SuspectRepository suspectRepository;
    private final WitnessRepository witnessRepository;
    private final EvidenceRepository evidenceRepository;

    /** GET /api/insights/case/{caseId} */
    @GetMapping("/case/{caseId}")
    public ResponseEntity<List<AiInsight>> getInsights(@PathVariable Long caseId) {
        return ResponseEntity.ok(
            aiInsightRepository.findByCaseEntityIdAndIsDismissedFalseOrderByGeneratedAtDesc(caseId)
        );
    }

    /**
     * POST /api/insights/generate/{caseId}
     * Auto-generates AI insights from current case data.
     */
    @PostMapping("/generate/{caseId}")
    public ResponseEntity<?> generateInsights(@PathVariable Long caseId) {
        Case c = caseRepository.findById(caseId)
            .orElseThrow(() -> new RuntimeException("Case not found"));

        List<AiInsight> insights = new ArrayList<>();

        // 1. Suspect Ranking Insight
        List<Suspect> suspects = suspectRepository
            .findByCaseEntityIdOrderByProbabilityScoreDesc(caseId);

        if (!suspects.isEmpty()) {
            Suspect top = suspects.get(0);
            AiInsight insightRank = new AiInsight();
            insightRank.setCaseEntity(c);
            insightRank.setInsightType("SUSPECT_RANKING");
            insightRank.setTitle("Primary Suspect Identified");
            insightRank.setContent(String.format(
                "Based on evidence correlation and proximity analysis, %s has the highest " +
                "probability score of %.1f%%. Immediate investigation recommended.",
                top.getName(), top.getProbabilityScore()
            ));
            insightRank.setSeverity(top.getProbabilityScore() > 70
                ? AiInsight.Severity.CRITICAL : AiInsight.Severity.ALERT);
            insightRank.setRelatedEntityType("SUSPECT");
            insightRank.setRelatedEntityId(top.getId());
            insightRank.setConfidence(top.getProbabilityScore());
            insights.add(insightRank);
        }

        // 2. Witness Contradiction Insight
        List<Witness> witnesses = witnessRepository.findByCaseEntityId(caseId);
        long contradictions = witnesses.stream()
            .filter(w -> w.getContradictions() != null && !w.getContradictions().isBlank())
            .count();

        if (contradictions > 0) {
            AiInsight contrInsight = new AiInsight();
            contrInsight.setCaseEntity(c);
            contrInsight.setInsightType("CONTRADICTION");
            contrInsight.setTitle("Witness Contradictions Detected");
            contrInsight.setContent(String.format(
                "%d witness statement(s) contain detected contradictions. " +
                "Cross-examination recommended to establish accurate timeline.", contradictions
            ));
            contrInsight.setSeverity(AiInsight.Severity.WARNING);
            contrInsight.setRelatedEntityType("WITNESS");
            contrInsight.setConfidence(80.0);
            insights.add(contrInsight);
        }

        // 3. Evidence Gap Insight
        List<Evidence> evidence = evidenceRepository.findByCaseEntityId(caseId);
        long keyEvidenceCount = evidence.stream()
            .filter(e -> Boolean.TRUE.equals(e.getIsKeyEvidence())).count();

        if (keyEvidenceCount == 0 && !evidence.isEmpty()) {
            AiInsight evInsight = new AiInsight();
            evInsight.setCaseEntity(c);
            evInsight.setInsightType("SUGGESTION");
            evInsight.setTitle("No Key Evidence Flagged");
            evInsight.setContent(
                "No evidence has been marked as 'key'. Consider reviewing existing " +
                "evidence and flagging critical items for faster suspect correlation."
            );
            evInsight.setSeverity(AiInsight.Severity.WARNING);
            evInsight.setConfidence(90.0);
            insights.add(evInsight);
        }

        // 4. Wanted Suspects Alert
        long wantedCount = suspects.stream()
            .filter(s -> s.getStatus() == Suspect.SuspectStatus.WANTED).count();
        if (wantedCount > 0) {
            AiInsight wantedInsight = new AiInsight();
            wantedInsight.setCaseEntity(c);
            wantedInsight.setInsightType("SUSPICIOUS_MOVEMENT");
            wantedInsight.setTitle("Wanted Suspects Active");
            wantedInsight.setContent(
                wantedCount + " suspect(s) marked WANTED. Coordinates with law enforcement " +
                "and activate surveillance on predicted escape routes."
            );
            wantedInsight.setSeverity(AiInsight.Severity.CRITICAL);
            wantedInsight.setConfidence(95.0);
            insights.add(wantedInsight);
        }

        // 5. Investigation Suggestion
        if (evidence.isEmpty()) {
            AiInsight sug = new AiInsight();
            sug.setCaseEntity(c);
            sug.setInsightType("SUGGESTION");
            sug.setTitle("Evidence Collection Pending");
            sug.setContent("No evidence has been logged for this case. " +
                "Physical evidence collection should be prioritized.");
            sug.setSeverity(AiInsight.Severity.INFO);
            sug.setConfidence(100.0);
            insights.add(sug);
        }

        aiInsightRepository.saveAll(insights);

        return ResponseEntity.ok(Map.of(
            "generated", insights.size(),
            "insights", insights
        ));
    }

    /** PUT /api/insights/{id}/dismiss */
    @PutMapping("/{id}/dismiss")
    public ResponseEntity<?> dismissInsight(@PathVariable Long id) {
        return aiInsightRepository.findById(id).map(i -> {
            i.setIsDismissed(true);
            return ResponseEntity.ok(aiInsightRepository.save(i));
        }).orElse(ResponseEntity.notFound().build());
    }
}
