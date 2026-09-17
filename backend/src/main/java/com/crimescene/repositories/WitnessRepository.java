package com.crimescene.repositories;

import com.crimescene.models.Witness;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WitnessRepository extends JpaRepository<Witness, Long> {
    List<Witness> findByCaseEntityId(Long caseId);
    long countByCaseEntityId(Long caseId);
}
