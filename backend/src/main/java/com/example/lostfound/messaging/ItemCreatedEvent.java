package com.example.lostfound.messaging;

import com.example.lostfound.model.ItemType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemCreatedEvent implements Serializable {

    private Long itemId;
    private ItemType itemType;
    private String title;
    private LocalDateTime createdAt;
}
