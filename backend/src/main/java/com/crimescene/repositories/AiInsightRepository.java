package com.crimescene.repositories;

import com.crimescene.models.AiInsight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AiInsightRepository extends JpaRepository<AiInsight, Long> {
    List<AiInsight> findByCaseEntityIdAndIsDismissedFalseOrderByGeneratedAtDesc(Long caseId);
    List<AiInsight> findByCaseEntityId(Long caseId);
}
