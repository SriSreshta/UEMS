package com.uems.server.repository;

import com.uems.server.model.ExamSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExamScheduleRepository extends JpaRepository<ExamSchedule, Long> {
    List<ExamSchedule> findByExamExamId(Long examId);
    List<ExamSchedule> findByExamYearAndExamSemesterAndIsBroadcastedTrue(Integer year, Integer semester);
}
