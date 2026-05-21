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

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminAuthService adminAuthService;
    private final AuditLogService auditLogService;

    @PostMapping("/login")
    public ResponseEntity<AdminLoginResponse> login(@Valid @RequestBody AdminLoginRequest request,
                                                     HttpServletRequest httpRequest) {
        try {
            String token = adminAuthService.login(request.getUsername(), request.getPassword());
            auditLogService.logAdminLogin(request.getUsername(), true, httpRequest);
            return ResponseEntity.ok(new AdminLoginResponse(token, "Login successful"));
        } catch (RuntimeException e) {
            auditLogService.logAdminLogin(request.getUsername(), false, httpRequest);
            return ResponseEntity.status(401).build();
        }
    }
}
