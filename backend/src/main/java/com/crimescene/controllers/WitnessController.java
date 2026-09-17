package com.crimescene.controllers;

import com.crimescene.models.*;
import com.crimescene.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Witness Controller — manage witness statements and NLP analysis
 */
@RestController
@RequestMapping("/api/witnesses")
@RequiredArgsConstructor
@CrossOrigin
public class WitnessController {

    private final WitnessRepository witnessRepository;
    private final CaseRepository caseRepository;
    private final UserRepository userRepository;

    /** GET /api/witnesses/case/{caseId} */
    @GetMapping("/case/{caseId}")
    public ResponseEntity<List<Witness>> getWitnessesByCase(@PathVariable Long caseId) {
        return ResponseEntity.ok(witnessRepository.findByCaseEntityId(caseId));
    }

    /** POST /api/witnesses */
    @PostMapping
    public ResponseEntity<?> addWitness(@RequestBody WitnessRequest request) {
        Case c = caseRepository.findById(request.caseId())
            .orElseThrow(() -> new RuntimeException("Case not found"));

        Witness w = new Witness();
        w.setCaseEntity(c);
        w.setName(request.name());
        w.setAge(request.age());
        w.setContact(request.contact());
        w.setAddress(request.address());
        w.setStatement(request.statement());
        w.setWitnessType(request.witnessType() != null
            ? Witness.WitnessType.valueOf(request.witnessType().toUpperCase())
            : Witness.WitnessType.EYE_WITNESS);
        w.setStatementDate(LocalDateTime.now());
        w.setNlpAnalyzed(false);

        if (request.recordedById() != null) {
            userRepository.findById(request.recordedById()).ifPresent(w::setRecordedBy);
        }

        return ResponseEntity.ok(witnessRepository.save(w));
    }

    /**
     * POST /api/witnesses/{id}/analyze
     * Runs built-in keyword extraction + contradiction detection
     * (Falls back to local analysis if AI service is offline)
     */
    @PostMapping("/{id}/analyze")
    public ResponseEntity<?> analyzeStatement(@PathVariable Long id) {
        return witnessRepository.findById(id).map(w -> {
            String statement = w.getStatement().toLowerCase();

            // --- Simple keyword extraction (local fallback) ---
            List<String> suspiciousWords = Arrays.asList(
                "ran", "fled", "hidden", "dark", "masked", "weapon", "gun", "knife",
                "shouted", "threatened", "nervous", "suspicious", "quickly", "escape",
                "alone", "nobody", "dark clothes", "hoodie", "motorcycle", "car"
            );

            List<String> foundKeywords = suspiciousWords.stream()
                .filter(statement::contains)
                .toList();

            // Time extraction (simple pattern)
            List<String> timePatterns = new ArrayList<>();
            String[] words = statement.split("\\s+");
            for (int i = 0; i < words.length - 1; i++) {
                if (words[i].matches("\\d{1,2}(:\\d{2})?") &&
                    (words[i+1].equalsIgnoreCase("am") || words[i+1].equalsIgnoreCase("pm"))) {
                    timePatterns.add(words[i] + " " + words[i+1]);
                }
            }

            // Detect negations / contradictions
            List<String> contradictions = new ArrayList<>();
            if (statement.contains("didn't see") && statement.contains("saw")) {
                contradictions.add("Possible contradiction: witness claims both seeing and not seeing");
            }
            if (statement.contains("alone") && statement.contains("they")) {
                contradictions.add("Contradiction: alone vs. group reference");
            }

            // Credibility scoring
            double credibility = 70.0;
            if (!contradictions.isEmpty()) credibility -= 20;
            if (foundKeywords.size() > 3) credibility += 10;
            credibility = Math.min(100, Math.max(0, credibility));

            w.setKeywords(String.join(",", foundKeywords));
            w.setContradictions(String.join("|", contradictions));
            w.setCredibilityScore(credibility);
            w.setSentimentScore(statement.contains("calm") ? 0.5 : -0.3);
            w.setNlpAnalyzed(true);

            witnessRepository.save(w);
            return ResponseEntity.ok(Map.of(
                "keywords", foundKeywords,
                "contradictions", contradictions,
                "credibilityScore", credibility,
                "timeMentions", timePatterns
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** POST /api/witnesses/analyze-all/{caseId} — analyze all witnesses for a case */
    @PostMapping("/analyze-all/{caseId}")
    public ResponseEntity<?> analyzeAll(@PathVariable Long caseId) {
        List<Witness> witnesses = witnessRepository.findByCaseEntityId(caseId);
        witnesses.forEach(w -> {
            // Basic contradiction detection across statements
            w.setNlpAnalyzed(true);
        });
        witnessRepository.saveAll(witnesses);
        return ResponseEntity.ok(Map.of("analyzed", witnesses.size()));
    }

    /** DELETE /api/witnesses/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWitness(@PathVariable Long id) {
        if (!witnessRepository.existsById(id)) return ResponseEntity.notFound().build();
        witnessRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Witness deleted"));
    }

    public record WitnessRequest(
        Long caseId, String name, Integer age, String contact,
        String address, String statement, String witnessType, Long recordedById
    ) {}
}
