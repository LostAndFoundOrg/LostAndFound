package com.example.lostfound.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Adds security HTTP headers to every response.
 * Защита от XSS, Clickjacking, MIME sniffing и т.д.
 */
@Component
public class SecurityHeadersFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        // Prevent clickjacking
        response.setHeader("X-Frame-Options", "DENY");
        // Prevent MIME type sniffing
        response.setHeader("X-Content-Type-Options", "nosniff");
        // Enable XSS filter in browser
        response.setHeader("X-XSS-Protection", "1; mode=block");
        // Strict referrer policy
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        // Don't cache sensitive API responses
        response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        // Remove server info header
        response.setHeader("Server", "");

        chain.doFilter(request, response);
    }
}
