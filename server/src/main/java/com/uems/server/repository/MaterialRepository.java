package com.uems.server.repository;

import com.uems.server.model.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MaterialRepository extends JpaRepository<Material, Long> {
    List<Material> findByCourseCourseId(Long courseId);
    List<Material> findByCourseCourseIdOrderByChapterAsc(Long courseId);
}
