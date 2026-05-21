package com.example.lostfound.dto;

import com.example.lostfound.model.ItemType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateItemRequest {

    @NotNull(message = "Item type is required")
    private ItemType type;

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 1000, message = "Description must be between 10 and 1000 characters")
    private String description;

    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Event date is required")
    private LocalDate eventDate;

    private String imageUrl;

    @NotBlank(message = "Contact name is required")
    private String contactName;

    @NotBlank(message = "Contact method is required")
    private String contactMethod;

    @NotBlank(message = "Contact value is required")
    private String contactValue;
}
