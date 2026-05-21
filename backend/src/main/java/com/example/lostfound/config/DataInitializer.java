package com.example.lostfound.config;

import com.example.lostfound.model.Category;
import com.example.lostfound.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final CategoryRepository categoryRepository;

    @Bean
    CommandLineRunner initData() {
        return args -> {
            if (categoryRepository.count() == 0) {
                List<String> categories = List.of(
                        "Electronics",
                        "Documents / ID Cards",
                        "Keys",
                        "Bags / Wallets",
                        "Books / Notebooks",
                        "Clothes",
                        "Accessories",
                        "Other"
                );

                categories.forEach(name ->
                        categoryRepository.save(Category.builder().name(name).build())
                );
            }
        };
    }
}