package com.crimescene.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "evidence")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Evidence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false)
    private Case caseEntity;

    @Column(name = "evidence_number", unique = true, length = 30)
    private String evidenceNumber;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EvidenceType type;

    @Column(name = "file_path", length = 500)
    private String filePath;

    @Column(name = "file_name", length = 200)
    private String fileName;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "collected_at")
    private LocalDateTime collectedAt;

    @Column(length = 255)
    private String location;

    private Double latitude;
    private Double longitude;

    @Column(name = "chain_of_custody", columnDefinition = "TEXT")
    private String chainOfCustody;

    @Column(columnDefinition = "TEXT")
    private String tags; // comma-separated

    @Column(name = "forensic_notes", columnDefinition = "TEXT")
    private String forensicNotes;

    @Column(name = "is_key_evidence")
    private Boolean isKeyEvidence = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() { this.updatedAt = LocalDateTime.now(); }

    public enum EvidenceType {
        IMAGE, VIDEO, DOCUMENT, AUDIO, PHYSICAL, DIGITAL, OTHER
    }
}
