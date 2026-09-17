package com.crimescene.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "witnesses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Witness {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false)
    private Case caseEntity;

    @Column(length = 100)
    private String name;

    private Integer age;

    @Column(length = 100)
    private String contact;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(name = "witness_type", length = 30)
    private WitnessType witnessType = WitnessType.EYE_WITNESS;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String statement;

    @Column(name = "statement_date")
    private LocalDateTime statementDate;

    // NLP extracted data (stored as JSON strings)
    @Column(columnDefinition = "TEXT")
    private String keywords;

    @Column(columnDefinition = "TEXT")
    private String entities;

    @Column(columnDefinition = "TEXT")
    private String contradictions;

    @Column(name = "credibility_score")
    private Double credibilityScore;

    @Column(name = "sentiment_score")
    private Double sentimentScore;

    @Column(name = "suspicious_flags", columnDefinition = "TEXT")
    private String suspiciousFlags;

    @Column(name = "nlp_analyzed")
    private Boolean nlpAnalyzed = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recorded_by")
    private User recordedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() { this.updatedAt = LocalDateTime.now(); }

    public enum WitnessType {
        EYE_WITNESS, BYSTANDER, EXPERT, CHARACTER, ALIBI
    }
}
