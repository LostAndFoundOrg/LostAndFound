package com.example.lostfound.config;

import com.example.lostfound.security.RateLimitFilter;
import com.example.lostfound.security.SecurityHeadersFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC configuration — регистрация фильтров и интерцепторов.
 */
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final AdminAuthInterceptor adminAuthInterceptor;
    private final RateLimitFilter rateLimitFilter;
    private final SecurityHeadersFilter securityHeadersFilter;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(adminAuthInterceptor)
                .addPathPatterns("/api/items/admin", "/api/items/*/approve",
                        "/api/items/*/reject", "/api/items/*/return");
    }

    @Bean
    public FilterRegistrationBean<RateLimitFilter> rateLimitRegistration() {
        FilterRegistrationBean<RateLimitFilter> reg = new FilterRegistrationBean<>(rateLimitFilter);
        reg.addUrlPatterns("/api/*");
        reg.setOrder(1);
        return reg;
    }

    @Bean
    public FilterRegistrationBean<SecurityHeadersFilter> securityHeadersRegistration() {
        FilterRegistrationBean<SecurityHeadersFilter> reg = new FilterRegistrationBean<>(securityHeadersFilter);
        reg.addUrlPatterns("/*");
        reg.setOrder(2);
        return reg;
    }
}
