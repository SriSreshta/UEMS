package com.uems.server.payload;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ForgotPasswordRequest {
    private String email;
}
