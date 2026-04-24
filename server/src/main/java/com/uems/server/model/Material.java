package com.uems.server.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "material")
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;

    /** e.g. "VIDEO", "BOOK", "ARTICLE" */
    private String type;

    /** Chapter number or name, e.g. "1", "2", "Introduction" */
    private String chapter;

    /** The URL link to the resource */
    private String fileUrl;

    // Many materials belong to one course
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;
}
