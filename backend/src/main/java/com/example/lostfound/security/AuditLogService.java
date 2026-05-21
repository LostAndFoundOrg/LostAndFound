package com.example.lostfound.security;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;


@Service
public class AuditLogService {

    private static final Logger auditLogger = LoggerFactory.getLogger("AUDIT");
    private static final Logger securityLogger = LoggerFactory.getLogger("SECURITY");

    public void logAdminAction(String action, Long itemId, HttpServletRequest request) {
        String ip = getClientIp(request);
        auditLogger.info("[ADMIN_ACTION] action={} itemId={} ip={} timestamp={}",
                action, itemId, ip, Instant.now());
    }

    public void logAdminLogin(String username, boolean success, HttpServletRequest request) {
        String ip = getClientIp(request);
        if (success) {
            auditLogger.info("[ADMIN_LOGIN] user={} ip={} status=SUCCESS timestamp={}",
                    username, ip, Instant.now());
        } else {
            securityLogger.warn("[ADMIN_LOGIN_FAILED] user={} ip={} status=FAILED timestamp={}",
                    username, ip, Instant.now());
        }
    }

    public void logSuspiciousActivity(String reason, HttpServletRequest request) {
        String ip = getClientIp(request);
        securityLogger.warn("[SUSPICIOUS] reason={} ip={} path={} method={} timestamp={}",
                reason, ip, request.getRequestURI(), request.getMethod(), Instant.now());
    }

    public void logRateLimitExceeded(HttpServletRequest request) {
        String ip = getClientIp(request);
        securityLogger.warn("[RATE_LIMIT_EXCEEDED] ip={} path={} timestamp={}",
                ip, request.getRequestURI(), Instant.now());
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
