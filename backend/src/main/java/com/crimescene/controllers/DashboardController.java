package com.crimescene.controllers;

import com.crimescene.models.*;
import com.crimescene.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Dashboard Controller — stats, heatmap data, and overview
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin
public class DashboardController {

    private final CaseRepository caseRepository;
    private final EvidenceRepository evidenceRepository;
    private final SuspectRepository suspectRepository;
    private final WitnessRepository witnessRepository;
    private final AiInsightRepository aiInsightRepository;

    /** GET /api/dashboard/stats */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalCases", caseRepository.count());
        stats.put("activeCases", caseRepository.countByStatus(Case.CaseStatus.ACTIVE)
                                + caseRepository.countByStatus(Case.CaseStatus.OPEN));
        stats.put("solvedCases", caseRepository.countByStatus(Case.CaseStatus.SOLVED));
        stats.put("closedCases", caseRepository.countByStatus(Case.CaseStatus.CLOSED));
        stats.put("totalSuspects", suspectRepository.count());
        stats.put("totalEvidence", evidenceRepository.count());
        stats.put("totalWitnesses", witnessRepository.count());
        stats.put("keyEvidence", evidenceRepository.countByIsKeyEvidenceTrue());
        stats.put("pendingInsights", aiInsightRepository.count());

        // Case status breakdown
        Map<String, Long> caseStatus = new LinkedHashMap<>();
        for (Case.CaseStatus s : Case.CaseStatus.values()) {
            caseStatus.put(s.name(), caseRepository.countByStatus(s));
        }
        stats.put("caseStatusBreakdown", caseStatus);

        return ResponseEntity.ok(stats);
    }

    /** GET /api/dashboard/heatmap — returns lat/lng points for crime locations */
    @GetMapping("/heatmap")
    public ResponseEntity<List<Map<String, Object>>> getHeatmap() {
        List<Case> cases = caseRepository.findAll();
        List<Map<String, Object>> points = cases.stream()
            .filter(c -> c.getLatitude() != null && c.getLongitude() != null)
            .map(c -> {
                Map<String, Object> point = new HashMap<>();
                point.put("lat", c.getLatitude());
                point.put("lng", c.getLongitude());
                point.put("caseId", c.getId());
                point.put("caseNumber", c.getCaseNumber());
                point.put("title", c.getTitle());
                point.put("status", c.getStatus().name());
                point.put("priority", c.getPriority().name());
                // Weight for heatmap intensity (CRITICAL = 4, HIGH = 3, etc.)
                int weight = switch (c.getPriority()) {
                    case CRITICAL -> 4;
                    case HIGH     -> 3;
                    case MEDIUM   -> 2;
                    case LOW      -> 1;
                };
                point.put("weight", weight);
                return point;
            })
            .collect(Collectors.toList());

        return ResponseEntity.ok(points);
    }

    /** GET /api/dashboard/recent-cases */
    @GetMapping("/recent-cases")
    public ResponseEntity<List<Case>> getRecentCases() {
        List<Case> all = caseRepository.findAllOrderByCreatedAtDesc();
        return ResponseEntity.ok(all.stream().limit(5).toList());
    }

    /** GET /api/dashboard/crime-types */
    @GetMapping("/crime-types")
    public ResponseEntity<Map<String, Long>> getCrimeTypes() {
        List<Case> cases = caseRepository.findAll();
        Map<String, Long> types = cases.stream()
            .filter(c -> c.getCrimeType() != null)
            .collect(Collectors.groupingBy(Case::getCrimeType, Collectors.counting()));
        return ResponseEntity.ok(types);
    }
}
