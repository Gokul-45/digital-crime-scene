package com.crimescene.controllers;

import com.crimescene.models.*;
import com.crimescene.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/cases")
@RequiredArgsConstructor
@CrossOrigin
public class CaseController {
    private final CaseRepository caseRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Case>> getAllCases() {
        return ResponseEntity.ok(caseRepository.findAllOrderByCreatedAtDesc());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCaseById(@PathVariable Long id) {
        return caseRepository.findById(id).map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createCase(@RequestBody CaseRequest request) {
        if (request.title() == null || request.title().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Title is required"));
        }
        if (request.incidentDate() == null || request.incidentDate().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Incident date is required"));
        }

        Case c = new Case();
        c.setCaseNumber(generateCaseNumber());
        c.setTitle(request.title().trim());
        c.setDescription(request.description());
        c.setLocation(request.location());
        c.setLatitude(parseDouble(request.latitude()));
        c.setLongitude(parseDouble(request.longitude()));
        c.setCrimeType(blankToNull(request.crimeType()));
        c.setStatus(Case.CaseStatus.OPEN);
        c.setPriority(parsePriority(request.priority()));
        c.setIncidentDate(parseDate(request.incidentDate()));
        c.setReportedDate(LocalDateTime.now());
        c.setCreatedAt(LocalDateTime.now());
        c.setUpdatedAt(LocalDateTime.now());

        if (request.createdById() != null) {
            userRepository.findById(request.createdById()).ifPresent(c::setCreatedBy);
        }
        if (request.leadInvestigatorId() != null) {
            userRepository.findById(request.leadInvestigatorId()).ifPresent(c::setLeadInvestigator);
        }
        return ResponseEntity.ok(caseRepository.save(c));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCase(@PathVariable Long id, @RequestBody CaseRequest request) {
        return caseRepository.findById(id).map(c -> {
            if (request.title() != null && !request.title().isBlank()) c.setTitle(request.title().trim());
            if (request.description() != null) c.setDescription(request.description());
            if (request.location() != null) c.setLocation(request.location());
            if (request.status() != null && !request.status().isBlank()) c.setStatus(Case.CaseStatus.valueOf(request.status().toUpperCase()));
            if (request.priority() != null && !request.priority().isBlank()) c.setPriority(parsePriority(request.priority()));
            if (request.latitude() != null && !request.latitude().isBlank()) c.setLatitude(parseDouble(request.latitude()));
            if (request.longitude() != null && !request.longitude().isBlank()) c.setLongitude(parseDouble(request.longitude()));
            if (request.leadInvestigatorId() != null) userRepository.findById(request.leadInvestigatorId()).ifPresent(c::setLeadInvestigator);
            return ResponseEntity.ok(caseRepository.save(c));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCase(@PathVariable Long id) {
        if (!caseRepository.existsById(id)) return ResponseEntity.notFound().build();
        caseRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Case deleted"));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Case>> getCasesByStatus(@PathVariable String status) {
        return ResponseEntity.ok(caseRepository.findByStatus(Case.CaseStatus.valueOf(status.toUpperCase())));
    }

    private String generateCaseNumber() { return "CASE-" + System.currentTimeMillis(); }
    private static String blankToNull(String value) { return value == null || value.isBlank() ? null : value; }
    private static Double parseDouble(String value) { return value == null || value.isBlank() ? null : Double.valueOf(value); }
    private static LocalDateTime parseDate(String value) { return LocalDateTime.parse(value.length() == 16 ? value + ":00" : value); }
    private static Case.Priority parsePriority(String value) {
        return Case.Priority.valueOf(value == null || value.isBlank() ? "MEDIUM" : value.toUpperCase());
    }

    public record CaseRequest(
        String title, String description, String location,
        String latitude, String longitude, String crimeType,
        String status, String priority, String incidentDate,
        Long createdById, Long leadInvestigatorId
    ) {}
}
