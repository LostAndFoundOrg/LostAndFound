package com.example.lostfound.dto;

import com.example.lostfound.model.ItemStatus;
import com.example.lostfound.model.ItemType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class ItemResponse {

    private Long id;

    private ItemType type;

    private String title;

    private String description;

    private Long categoryId;

    private String categoryName;

    private String location;

    private LocalDate eventDate;

    private String imageUrl;

    private String contactName;

    private String contactMethod;

    private String contactValue;

    private ItemStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
