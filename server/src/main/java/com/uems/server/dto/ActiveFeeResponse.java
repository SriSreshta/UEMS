package com.uems.server.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ActiveFeeResponse {
    private Long id;
    private String title;
    private Double baseAmount;
    private LocalDate dueDate;
    private Double lateFeePerWeek;
    
    // Dynamically calculated per student context
    private Double currentLateFee; 
    private Double totalAmountDue;

    private LocalDateTime createdAt;
    private boolean isPaid; // if already paid
}
