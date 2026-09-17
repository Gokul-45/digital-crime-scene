package com.crimescene.repositories;

import com.crimescene.models.Case;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CaseRepository extends JpaRepository<Case, Long> {
    Optional<Case> findByCaseNumber(String caseNumber);
    List<Case> findByStatus(Case.CaseStatus status);
    List<Case> findByCreatedById(Long userId);
    List<Case> findByLeadInvestigatorId(Long userId);
    long countByStatus(Case.CaseStatus status);

    @Query("SELECT c FROM Case c ORDER BY c.createdAt DESC")
    List<Case> findAllOrderByCreatedAtDesc();
}
