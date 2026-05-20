package com.example.lostfound.controller;

import com.example.lostfound.dto.CreateItemRequest;
import com.example.lostfound.dto.ItemResponse;
import com.example.lostfound.model.Item;
import com.example.lostfound.service.ItemService;
import com.example.lostfound.service.MatchingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;
    private final MatchingService matchingService;

    @GetMapping
    public List<ItemResponse> getItems() {
        return itemService.getApprovedItems().stream()
                .map(ItemResponse::new)
                .toList();
    }

    @GetMapping("/admin")
    public List<ItemResponse> getAdminItems() {
        return itemService.getAllItems().stream()
                .map(ItemResponse::new)
                .toList();
    }

    @PostMapping
    public ItemResponse createItem(@Valid @RequestBody CreateItemRequest request) {
        Item item = itemService.createItem(request);
        return new ItemResponse(item);
    }

    @GetMapping("/{id}/matches")
    public List<ItemResponse> getMatches(@PathVariable Long id) {
        return matchingService.findMatches(id).stream()
                .map(ItemResponse::new)
                .toList();
    }

    @PatchMapping("/{id}/approve")
    public ItemResponse approveItem(@PathVariable Long id) {
        Item item = itemService.approveItem(id);
        return new ItemResponse(item);
    }

    @PatchMapping("/{id}/reject")
    public ItemResponse rejectItem(@PathVariable Long id) {
        Item item = itemService.rejectItem(id);
        return new ItemResponse(item);
    }

    @PatchMapping("/{id}/return")
    public ItemResponse returnItem(@PathVariable Long id) {
        Item item = itemService.returnItem(id);
        return new ItemResponse(item);
    }
}