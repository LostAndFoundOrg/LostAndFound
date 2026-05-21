package com.example.lostfound.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminLoginRequest {

    @NotBlank(message = "Username is required")
    @Size(max = 50, message = "Username too long")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(max = 100, message = "Password too long")
    private String password;
}
