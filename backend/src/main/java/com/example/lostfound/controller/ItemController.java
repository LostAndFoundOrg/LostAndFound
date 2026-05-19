package com.example.lostfound.controller;

import com.example.lostfound.dto.CreateItemRequest;
import com.example.lostfound.model.Item;
import com.example.lostfound.model.ItemStatus;
import com.example.lostfound.model.ItemType;
import com.example.lostfound.service.ItemService;
import com.example.lostfound.service.MatchingService;
import com.example.lostfound.repository.ItemRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {
    private final MatchingService matchingService;
    private final ItemRepository itemRepository;
    private final ItemService itemService;

    @GetMapping
    public List<Item> getItems() {
        return itemService.getApprovedItems();
    }

    @PostMapping
    public Item createItem(@Valid @RequestBody CreateItemRequest request) {
        return itemService.createItem(request);
    }
    @GetMapping("/{id}/matches")
    public ResponseEntity<List<Item>> getMatches(@PathVariable Long id) {
        Item currentItem = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        ItemType oppositeType = (currentItem.getType() == ItemType.LOST) ? ItemType.FOUND : ItemType.LOST;

        List<Item> oppositeItems = itemRepository.findByTypeAndStatus(oppositeType, ItemStatus.APPROVED);

        oppositeItems.sort((item1, item2) -> {
            int score1 = matchingService.calculateScore(currentItem, item1);
            int score2 = matchingService.calculateScore(currentItem, item2);
            return Integer.compare(score2, score1);
        });

        return ResponseEntity.ok(oppositeItems);
    }}
