package com.crimescene.repositories;

import com.crimescene.models.Suspect;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SuspectRepository extends JpaRepository<Suspect, Long> {
    List<Suspect> findByCaseEntityId(Long caseId);
    long countByCaseEntityId(Long caseId);

    @Query("SELECT s FROM Suspect s WHERE s.caseEntity.id = :caseId ORDER BY s.probabilityScore DESC")
    List<Suspect> findByCaseEntityIdOrderByProbabilityScoreDesc(Long caseId);
}
