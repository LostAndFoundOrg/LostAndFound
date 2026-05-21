package com.example.lostfound.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Rate Limiting Filter — ограничение запросов с одного IP.
 * Защита от брутфорса и DDoS на уровне приложения.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    // Max requests per window per IP
    private static final int MAX_REQUESTS = 100;
    // Window size in seconds
    private static final long WINDOW_SECONDS = 60;
    // Stricter limit for login endpoint (anti brute-force)
    private static final int MAX_LOGIN_REQUESTS = 5;

    private final Map<String, RequestCounter> requestCounts = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String ip = getClientIp(request);
        String path = request.getRequestURI();

        int limit = path.contains("/admin/login") ? MAX_LOGIN_REQUESTS : MAX_REQUESTS;

        RequestCounter counter = requestCounts.computeIfAbsent(ip, k -> new RequestCounter());
        counter.cleanup();

        if (counter.getCount() >= limit) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Too many requests. Please try again later.\"}");
            return;
        }

        counter.increment();
        response.addHeader("X-RateLimit-Limit", String.valueOf(limit));
        response.addHeader("X-RateLimit-Remaining", String.valueOf(limit - counter.getCount()));

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private static class RequestCounter {
        private final AtomicInteger count = new AtomicInteger(0);
        private volatile long windowStart = Instant.now().getEpochSecond();

        void cleanup() {
            long now = Instant.now().getEpochSecond();
            if (now - windowStart >= WINDOW_SECONDS) {
                count.set(0);
                windowStart = now;
            }
        }

        int getCount() { return count.get(); }
        void increment() { count.incrementAndGet(); }
    }
}
