package com.uems.server.repository;

import com.uems.server.model.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FacultyRepository extends JpaRepository<Faculty, Long> {
    Faculty findByUserId(Long userId);
}
