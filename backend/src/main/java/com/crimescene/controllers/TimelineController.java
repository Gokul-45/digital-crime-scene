package com.crimescene.controllers;

import com.crimescene.models.*;
import com.crimescene.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Timeline Controller — manage and reconstruct crime timeline
 */
@RestController
@RequestMapping("/api/timeline")
@RequiredArgsConstructor
@CrossOrigin
public class TimelineController {

    private final TimelineEventRepository timelineEventRepository;
    private final CaseRepository caseRepository;
    private final EvidenceRepository evidenceRepository;
    private final SuspectRepository suspectRepository;
    private final WitnessRepository witnessRepository;
    private final UserRepository userRepository;

    /** GET /api/timeline/{caseId} — all events sorted chronologically */
    @GetMapping("/{caseId}")
    public ResponseEntity<?> getTimeline(@PathVariable Long caseId) {
        List<TimelineEvent> events = timelineEventRepository
            .findByCaseEntityIdOrderByEventTimeAsc(caseId);

        // Group by phase
        Map<String, List<TimelineEvent>> grouped = new LinkedHashMap<>();
        grouped.put("BEFORE", new ArrayList<>());
        grouped.put("DURING", new ArrayList<>());
        grouped.put("AFTER",  new ArrayList<>());

        for (TimelineEvent e : events) {
            grouped.get(e.getPhase().name()).add(e);
        }

        return ResponseEntity.ok(Map.of(
            "total", events.size(),
            "events", events,
            "grouped", grouped
        ));
    }

    /** POST /api/timeline/event */
    @PostMapping("/event")
    public ResponseEntity<?> addEvent(@RequestBody EventRequest request) {
        Case c = caseRepository.findById(request.caseId())
            .orElseThrow(() -> new RuntimeException("Case not found"));

        TimelineEvent e = new TimelineEvent();
        e.setCaseEntity(c);
        e.setTitle(request.title());
        e.setDescription(request.description());
        e.setPhase(TimelineEvent.Phase.valueOf(request.phase().toUpperCase()));
        e.setEventType(request.eventType());
        e.setEventTime(LocalDateTime.parse(request.eventTime()));
        e.setSource(request.source());
        e.setConfidenceLevel(request.confidenceLevel() != null ? request.confidenceLevel() : 50.0);
        e.setIsVerified(request.isVerified() != null && request.isVerified());
        e.setLatitude(request.latitude());
        e.setLongitude(request.longitude());

        if (request.evidenceId() != null) {
            evidenceRepository.findById(request.evidenceId()).ifPresent(e::setRelatedEvidence);
        }
        if (request.suspectId() != null) {
            suspectRepository.findById(request.suspectId()).ifPresent(e::setRelatedSuspect);
        }
        if (request.witnessId() != null) {
            witnessRepository.findById(request.witnessId()).ifPresent(e::setRelatedWitness);
        }
        if (request.createdById() != null) {
            userRepository.findById(request.createdById()).ifPresent(e::setCreatedBy);
        }

        return ResponseEntity.ok(timelineEventRepository.save(e));
    }

    /**
     * POST /api/timeline/reconstruct/{caseId}
     * Auto-generates timeline events from evidence timestamps and witness data.
     */
    @PostMapping("/reconstruct/{caseId}")
    public ResponseEntity<?> reconstructTimeline(@PathVariable Long caseId) {
        Case c = caseRepository.findById(caseId)
            .orElseThrow(() -> new RuntimeException("Case not found"));

        List<TimelineEvent> generated = new ArrayList<>();

        // 1. Create events from evidence collected timestamps
        List<Evidence> evidenceList = evidenceRepository.findByCaseEntityId(caseId);
        for (Evidence ev : evidenceList) {
            if (ev.getCollectedAt() != null) {
                TimelineEvent te = new TimelineEvent();
                te.setCaseEntity(c);
                te.setTitle("Evidence Collected: " + ev.getTitle());
                te.setDescription("Type: " + ev.getType() + ". " + ev.getDescription());
                te.setEventType("EVIDENCE_FOUND");
                te.setEventTime(ev.getCollectedAt());
                te.setRelatedEvidence(ev);
                te.setLatitude(ev.getLatitude());
                te.setLongitude(ev.getLongitude());
                te.setSource("Evidence Database");

                // Assign phase relative to incident time
                te.setPhase(assignPhase(ev.getCollectedAt(), c.getIncidentDate()));
                te.setConfidenceLevel(70.0);
                generated.add(te);
            }
        }

        // 2. Create events from witness statement dates
        List<Witness> witnesses = witnessRepository.findByCaseEntityId(caseId);
        for (Witness w : witnesses) {
            if (w.getStatementDate() != null) {
                TimelineEvent te = new TimelineEvent();
                te.setCaseEntity(c);
                te.setTitle("Witness Statement: " + w.getName());
                te.setDescription(w.getStatement() != null && w.getStatement().length() > 100
                    ? w.getStatement().substring(0, 100) + "..."
                    : w.getStatement());
                te.setEventType("WITNESS_ACCOUNT");
                te.setEventTime(w.getStatementDate());
                te.setPhase(TimelineEvent.Phase.AFTER);
                te.setRelatedWitness(w);
                te.setSource("Witness Interview");
                te.setConfidenceLevel(w.getCredibilityScore() != null ? w.getCredibilityScore() : 50.0);
                generated.add(te);
            }
        }

        // Remove existing auto-generated events, then save new ones
        timelineEventRepository.saveAll(generated);

        return ResponseEntity.ok(Map.of(
            "message"           , "Timeline reconstructed",
            "eventsGenerated"   , generated.size(),
            "fromEvidence"      , evidenceList.size(),
            "fromWitnesses"     , witnesses.size()
        ));
    }

    private TimelineEvent.Phase assignPhase(LocalDateTime eventTime, LocalDateTime incidentTime) {
        if (incidentTime == null) return TimelineEvent.Phase.DURING;
        if (eventTime.isBefore(incidentTime.minusHours(1))) return TimelineEvent.Phase.BEFORE;
        if (eventTime.isAfter(incidentTime.plusHours(1)))   return TimelineEvent.Phase.AFTER;
        return TimelineEvent.Phase.DURING;
    }

    /** DELETE /api/timeline/event/{id} */
    @DeleteMapping("/event/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        if (!timelineEventRepository.existsById(id)) return ResponseEntity.notFound().build();
        timelineEventRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Event deleted"));
    }

    public record EventRequest(
        Long caseId, String title, String description, String phase,
        String eventType, String eventTime, String source,
        Double confidenceLevel, Boolean isVerified,
        Double latitude, Double longitude,
        Long evidenceId, Long suspectId, Long witnessId, Long createdById
    ) {}
}
