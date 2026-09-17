package com.crimescene.repositories;

import com.crimescene.models.TimelineEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TimelineEventRepository extends JpaRepository<TimelineEvent, Long> {
    List<TimelineEvent> findByCaseEntityIdOrderByEventTimeAsc(Long caseId);
    List<TimelineEvent> findByCaseEntityIdAndPhaseOrderByEventTimeAsc(Long caseId, TimelineEvent.Phase phase);
}
