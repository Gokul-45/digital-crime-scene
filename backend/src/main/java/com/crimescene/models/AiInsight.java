package com.crimescene.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_insights")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiInsight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false)
    private Case caseEntity;

    @Column(name = "insight_type", nullable = false, length = 50)
    private String insightType; // SUSPICIOUS_MOVEMENT, CONTRADICTION, SUSPECT_RANKING, SUGGESTION

    @Column(length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Severity severity = Severity.INFO;

    @Column(name = "related_entity_type", length = 50)
    private String relatedEntityType; // SUSPECT, WITNESS, EVIDENCE

    @Column(name = "related_entity_id")
    private Long relatedEntityId;

    private Double confidence;

    @Column(name = "is_dismissed")
    private Boolean isDismissed = false;

    @Column(name = "generated_at")
    private LocalDateTime generatedAt = LocalDateTime.now();

    public enum Severity { INFO, WARNING, ALERT, CRITICAL }
}
