package com.crimescene.controllers;

import com.crimescene.models.*;
import com.crimescene.repositories.*;
import com.crimescene.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Case Controller — CRUD for crime cases
 */
@RestController
@RequestMapping("/api/cases")
@RequiredArgsConstructor
@CrossOrigin
public class CaseController {

    private final CaseRepository caseRepository;
    private final UserRepository userRepository;

    /** GET /api/cases */
    @GetMapping
    public ResponseEntity<List<Case>> getAllCases() {
        return ResponseEntity.ok(caseRepository.findAllOrderByCreatedAtDesc());
    }

    /** GET /api/cases/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<?> getCaseById(@PathVariable Long id) {
        return caseRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /** POST /api/cases */
    @PostMapping
    public ResponseEntity<?> createCase(@RequestBody CaseRequest request) {
        Case c = new Case();
        c.setCaseNumber(generateCaseNumber());
        c.setTitle(request.title());
        c.setDescription(request.description());
        c.setLocation(request.location());
        c.setLatitude(request.latitude());
        c.setLongitude(request.longitude());
        c.setCrimeType(request.crimeType());
        c.setStatus(Case.CaseStatus.OPEN);
        c.setPriority(Case.Priority.valueOf(
            request.priority() != null ? request.priority().toUpperCase() : "MEDIUM")
        );
        c.setIncidentDate(request.incidentDate() != null
            ? LocalDateTime.parse(request.incidentDate())
            : LocalDateTime.now());

        if (request.createdById() != null) {
            userRepository.findById(request.createdById()).ifPresent(c::setCreatedBy);
        }
        if (request.leadInvestigatorId() != null) {
            userRepository.findById(request.leadInvestigatorId()).ifPresent(c::setLeadInvestigator);
        }

        return ResponseEntity.ok(caseRepository.save(c));
    }

    /** PUT /api/cases/{id} */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCase(@PathVariable Long id, @RequestBody CaseRequest request) {
        return caseRepository.findById(id).map(c -> {
            if (request.title() != null) c.setTitle(request.title());
            if (request.description() != null) c.setDescription(request.description());
            if (request.location() != null) c.setLocation(request.location());
            if (request.status() != null) c.setStatus(Case.CaseStatus.valueOf(request.status().toUpperCase()));
            if (request.priority() != null) c.setPriority(Case.Priority.valueOf(request.priority().toUpperCase()));
            if (request.latitude() != null) c.setLatitude(request.latitude());
            if (request.longitude() != null) c.setLongitude(request.longitude());
            if (request.leadInvestigatorId() != null) {
                userRepository.findById(request.leadInvestigatorId()).ifPresent(c::setLeadInvestigator);
            }
            return ResponseEntity.ok(caseRepository.save(c));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** DELETE /api/cases/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCase(@PathVariable Long id) {
        if (!caseRepository.existsById(id)) return ResponseEntity.notFound().build();
        caseRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Case deleted"));
    }

    /** GET /api/cases/status/{status} */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Case>> getCasesByStatus(@PathVariable String status) {
        return ResponseEntity.ok(caseRepository.findByStatus(
            Case.CaseStatus.valueOf(status.toUpperCase()))
        );
    }

    private String generateCaseNumber() {
        return "CASE-" + System.currentTimeMillis();
    }

    public record CaseRequest(
        String title, String description, String location,
        Double latitude, Double longitude, String crimeType,
        String status, String priority, String incidentDate,
        Long createdById, Long leadInvestigatorId
    ) {}
}
