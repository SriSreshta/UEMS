package com.uems.server.payload;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ResetPasswordRequest {
    private String token;
    private String newPassword;
}
