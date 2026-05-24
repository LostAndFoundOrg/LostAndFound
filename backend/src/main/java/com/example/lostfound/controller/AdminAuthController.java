package com.example.lostfound.controller;

import com.example.lostfound.dto.AdminLoginRequest;
import com.example.lostfound.dto.AdminLoginResponse;
import com.example.lostfound.security.AuditLogService;
import com.example.lostfound.service.AdminAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminAuthService adminAuthService;
    private final AuditLogService auditLogService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AdminLoginRequest request,
                                   HttpServletRequest httpRequest) {
        String ip = getClientIp(httpRequest);

        
        if (adminAuthService.isLockedOut(ip)) {
            auditLogService.logSuspiciousActivity("Login attempt while locked out", httpRequest);
            return ResponseEntity.status(429)
                    .body(Map.of("message", "Too many failed attempts. Try again in 15 minutes."));
        }

        try {
            String token = adminAuthService.login(request.getUsername(), request.getPassword(), ip);
            auditLogService.logAdminLogin(request.getUsername(), true, httpRequest);
            return ResponseEntity.ok(new AdminLoginResponse(token, "ADMIN"));
        } catch (RuntimeException e) {
            auditLogService.logAdminLogin(request.getUsername(), false, httpRequest);
            int remaining = adminAuthService.getRemainingAttempts(ip);
            if (remaining == 0) {
                return ResponseEntity.status(429)
                        .body(Map.of("message", "Account locked after too many attempts. Try again in 15 minutes."));
            }
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Invalid credentials. Attempts remaining: " + remaining));
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
