package com.example.lostfound.dto;

import com.example.lostfound.model.Item;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ItemResponse {

    private Long id;
    private String type;
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

    private String status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ItemResponse() {
    }

    public ItemResponse(Item item) {
        this.id = item.getId();
        this.type = item.getType().toString();
        this.title = item.getTitle();
        this.description = item.getDescription();

        if (item.getCategory() != null) {
            this.categoryId = item.getCategory().getId();
            this.categoryName = item.getCategory().getName();
        }

        this.location = item.getLocation();
        this.eventDate = item.getEventDate();
        this.imageUrl = item.getImageUrl();

        this.contactName = item.getContactName();
        this.contactMethod = item.getContactMethod();
        this.contactValue = item.getContactValue();

        this.status = item.getStatus().toString();

        this.createdAt = item.getCreatedAt();
        this.updatedAt = item.getUpdatedAt();
    }

    public Long getId() {
        return id;
    }

    public String getType() {
        return type;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public String getLocation() {
        return location;
    }

    public LocalDate getEventDate() {
        return eventDate;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getContactName() {
        return contactName;
    }

    public String getContactMethod() {
        return contactMethod;
    }

    public String getContactValue() {
        return contactValue;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}