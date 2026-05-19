package com.example.lostfound.controller;

import com.example.lostfound.dto.CreateItemRequest;
import com.example.lostfound.dto.ItemResponse;
import com.example.lostfound.model.Item;
import com.example.lostfound.service.ItemService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

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

    @GetMapping("/admin")
    public List<ItemResponse> getAllItemsForAdmin() {
        return itemService.getAllItems()
                .stream()
                .map(ItemResponse::new)
                .toList();
    }

}
