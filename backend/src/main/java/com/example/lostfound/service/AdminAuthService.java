package com.example.lostfound.service;

import com.example.lostfound.security.AuditLogService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class AdminAuthService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long LOCKOUT_SECONDS = 15 * 60; 

    @Value("${admin.username}")
    private String adminUsername;

    @Value("${admin.password.hash}")
    private String adminPasswordHash;

    private String currentToken;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

   
    private final ConcurrentHashMap<String, FailedAttempts> failedAttempts = new ConcurrentHashMap<>();

    public String login(String username, String password, String ip) {
        checkLockout(ip);

        boolean usernameMatch = adminUsername.equals(username);
        boolean passwordMatch = usernameMatch && passwordEncoder.matches(password, adminPasswordHash);

        if (!usernameMatch || !passwordMatch) {
            recordFailedAttempt(ip);
            throw new RuntimeException("Invalid admin credentials");
        }

        resetFailedAttempts(ip);
        currentToken = UUID.randomUUID().toString();
        return currentToken;
    }

    public boolean isValidToken(String token) {
        return token != null && token.equals(currentToken);
    }

    public boolean isLockedOut(String ip) {
        FailedAttempts fa = failedAttempts.get(ip);
        if (fa == null) return false;
        if (fa.count.get() >= MAX_FAILED_ATTEMPTS) {
            long elapsed = Instant.now().getEpochSecond() - fa.firstFailedAt;
            if (elapsed < LOCKOUT_SECONDS) return true;
            failedAttempts.remove(ip);
        }
        return false;
    }

    public int getRemainingAttempts(String ip) {
        FailedAttempts fa = failedAttempts.get(ip);
        if (fa == null) return MAX_FAILED_ATTEMPTS;
        return Math.max(0, MAX_FAILED_ATTEMPTS - fa.count.get());
    }

    private void checkLockout(String ip) {
        if (isLockedOut(ip)) {
            throw new RuntimeException("Account locked. Try again in 15 minutes.");
        }
    }

    private void recordFailedAttempt(String ip) {
        failedAttempts.compute(ip, (k, fa) -> {
            if (fa == null) fa = new FailedAttempts();
            fa.count.incrementAndGet();
            return fa;
        });
    }

    private void resetFailedAttempts(String ip) {
        failedAttempts.remove(ip);
    }

   
    public static String encodePassword(String rawPassword) {
        return new BCryptPasswordEncoder().encode(rawPassword);
    }

    private static class FailedAttempts {
        final AtomicInteger count = new AtomicInteger(0);
        final long firstFailedAt = Instant.now().getEpochSecond();
    }
}
