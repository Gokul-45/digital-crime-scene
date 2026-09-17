package com.crimescene.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "timeline_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimelineEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false)
    private Case caseEntity;

    @Column(name = "event_time", nullable = false)
    private LocalDateTime eventTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Phase phase;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "event_type", length = 50)
    private String eventType; // MOVEMENT, EVIDENCE_FOUND, WITNESS_ACCOUNT, CCTV, CALL

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_evidence_id")
    private Evidence relatedEvidence;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_suspect_id")
    private Suspect relatedSuspect;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_witness_id")
    private Witness relatedWitness;

    private Double latitude;
    private Double longitude;

    @Column(name = "confidence_level")
    private Double confidenceLevel = 50.0;

    @Column(length = 100)
    private String source;

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Phase { BEFORE, DURING, AFTER }
}
