package com.crimescene.controllers;

import com.crimescene.models.*;
import com.crimescene.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Evidence Controller — manage case evidence
 */
@RestController
@RequestMapping("/api/evidence")
@RequiredArgsConstructor
@CrossOrigin
public class EvidenceController {

    private final EvidenceRepository evidenceRepository;
    private final CaseRepository caseRepository;
    private final UserRepository userRepository;

    /** GET /api/evidence/case/{caseId} */
    @GetMapping("/case/{caseId}")
    public ResponseEntity<List<Evidence>> getEvidenceByCase(@PathVariable Long caseId) {
        return ResponseEntity.ok(evidenceRepository.findByCaseEntityId(caseId));
    }

    /** GET /api/evidence/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<?> getEvidence(@PathVariable Long id) {
        return evidenceRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /** POST /api/evidence */
    @PostMapping
    public ResponseEntity<?> addEvidence(@RequestBody EvidenceRequest request) {
        Case c = caseRepository.findById(request.caseId())
            .orElseThrow(() -> new RuntimeException("Case not found"));

        Evidence e = new Evidence();
        e.setCaseEntity(c);
        e.setTitle(request.title());
        e.setDescription(request.description());
        e.setType(Evidence.EvidenceType.valueOf(request.type().toUpperCase()));
        e.setLocation(request.location());
        e.setLatitude(request.latitude());
        e.setLongitude(request.longitude());
        e.setForensicNotes(request.forensicNotes());
        e.setTags(request.tags());
        e.setIsKeyEvidence(request.isKeyEvidence() != null && request.isKeyEvidence());
        e.setChainOfCustody(request.chainOfCustody());
        e.setCollectedAt(request.collectedAt() != null
            ? LocalDateTime.parse(request.collectedAt()) : LocalDateTime.now());
        e.setEvidenceNumber("EVD-" + System.currentTimeMillis());

        if (request.uploadedById() != null) {
            userRepository.findById(request.uploadedById()).ifPresent(e::setUploadedBy);
        }

        return ResponseEntity.ok(evidenceRepository.save(e));
    }

    /** PUT /api/evidence/{id}/tag */
    @PutMapping("/{id}/tag")
    public ResponseEntity<?> updateTags(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return evidenceRepository.findById(id).map(e -> {
            e.setTags(body.get("tags"));
            e.setForensicNotes(body.getOrDefault("forensicNotes", e.getForensicNotes()));
            return ResponseEntity.ok(evidenceRepository.save(e));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** DELETE /api/evidence/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvidence(@PathVariable Long id) {
        if (!evidenceRepository.existsById(id)) return ResponseEntity.notFound().build();
        evidenceRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Evidence deleted"));
    }

    public record EvidenceRequest(
        Long caseId, String title, String description, String type,
        String location, Double latitude, Double longitude,
        String forensicNotes, String tags, Boolean isKeyEvidence,
        String chainOfCustody, String collectedAt, Long uploadedById
    ) {}
}
