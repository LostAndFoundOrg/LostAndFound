package com.example.lostfound.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AdminAuthService {

    @Value("${admin.username}")
    private String adminUsername;

    @Value("${admin.password}")
    private String adminPassword;

    private String currentToken;

    public String login(String username, String password) {
        if (!adminUsername.equals(username) || !adminPassword.equals(password)) {
            throw new RuntimeException("Invalid admin credentials");
        }

        currentToken = UUID.randomUUID().toString();
        return currentToken;
    }

    public boolean isValidToken(String token) {
        return token != null && token.equals(currentToken);
    }
}
