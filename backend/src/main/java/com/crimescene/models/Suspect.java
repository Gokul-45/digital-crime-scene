package com.crimescene.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "suspects")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Suspect {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false)
    private Case caseEntity;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 100)
    private String alias;

    private Integer age;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "photo_path", length = 500)
    private String photoPath;

    @Column(name = "last_known_location", length = 255)
    private String lastKnownLocation;

    @Column(name = "last_seen_latitude")
    private Double lastSeenLatitude;

    @Column(name = "last_seen_longitude")
    private Double lastSeenLongitude;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private SuspectStatus status = SuspectStatus.PERSON_OF_INTEREST;

    // Probability scores (0-100)
    @Column(name = "probability_score")
    private Double probabilityScore = 0.0;

    @Column(name = "evidence_match_score")
    private Double evidenceMatchScore = 0.0;

    @Column(name = "proximity_score")
    private Double proximityScore = 0.0;

    @Column(name = "timeline_score")
    private Double timelineScore = 0.0;

    @Column(name = "behavior_score")
    private Double behaviorScore = 0.0;

    // JSON arrays: [{lat, lng, timestamp, location}]
    @Column(name = "movement_path", columnDefinition = "TEXT")
    private String movementPath;

    @Column(name = "predicted_path", columnDefinition = "TEXT")
    private String predictedPath;

    @Column(name = "criminal_record", columnDefinition = "TEXT")
    private String criminalRecord;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "added_by")
    private User addedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() { this.updatedAt = LocalDateTime.now(); }

    public enum SuspectStatus {
        PERSON_OF_INTEREST, SUSPECT, ARRESTED, CLEARED, WANTED
    }
}
