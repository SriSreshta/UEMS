package com.uems.server.repository;

import com.uems.server.model.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FacultyRepository extends JpaRepository<Faculty, Long> {
    Faculty findByUserId(Long userId);
    Optional<Faculty> findByUserUsername(String username);
}
