package com.crimescene.repositories;

import com.crimescene.models.Evidence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EvidenceRepository extends JpaRepository<Evidence, Long> {
    List<Evidence> findByCaseEntityId(Long caseId);
    List<Evidence> findByCaseEntityIdAndType(Long caseId, Evidence.EvidenceType type);
    long countByCaseEntityId(Long caseId);
    long countByIsKeyEvidenceTrue();
}
