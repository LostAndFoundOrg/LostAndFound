package com.example.lostfound.controller;

import com.example.lostfound.dto.CreateItemRequest;
import com.example.lostfound.model.Item;
import com.example.lostfound.dto.ItemResponse;
import java.util.List;
import com.example.lostfound.service.ItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    @GetMapping
    public List<ItemResponse> getItems() {
        return itemService.getApprovedItems()
                .stream()
                .map(ItemResponse::new)
                .toList();
    }

    @PostMapping
    public ItemResponse createItem(@RequestBody CreateItemRequest request) {
        Item item = itemService.createItem(request);
        return new ItemResponse(item);
    }
}
