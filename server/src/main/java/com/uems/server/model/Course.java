package com.uems.server.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "course")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "course_id")
    private Long courseId;

    private String code;
    private String name;
    private String department;
    private String semester;
    private Integer year;
    private Long roleId;
    
    @Column(name = "is_open_elective")
    private Boolean isOpenElective = false;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer credits = 3;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faculty_id")
    @JsonBackReference // prevent recursion back to Faculty
    private Faculty faculty;
}
