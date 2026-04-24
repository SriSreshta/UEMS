package com.uems.server.repository;

import com.uems.server.model.FeeNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FeeNotificationRepository extends JpaRepository<FeeNotification, Long> {
    
    @Query("SELECT f FROM FeeNotification f WHERE " +
           "(f.targetYear = :year OR f.targetYear = 'All') AND " +
           "(f.targetSemester = :semester OR f.targetSemester = 'All') " +
           "ORDER BY f.createdAt DESC")
    List<FeeNotification> findApplicableFees(@Param("year") String year, @Param("semester") String semester);
}
