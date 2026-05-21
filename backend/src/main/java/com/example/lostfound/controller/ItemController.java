package com.example.lostfound.controller;

import com.example.lostfound.dto.CreateItemRequest;
import com.example.lostfound.dto.ItemResponse;
import com.example.lostfound.model.Item;
import com.example.lostfound.security.AuditLogService;
import com.example.lostfound.service.CloudinaryService;
import com.example.lostfound.service.ItemService;
import com.example.lostfound.service.MatchingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;
    private final MatchingService matchingService;
    private final CloudinaryService cloudinaryService;
    private final AuditLogService auditLogService;

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

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ItemResponse createItem(
            @ModelAttribute @Valid CreateItemRequest request,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        String imageUrl = cloudinaryService.uploadItemPhoto(image);
        request.setImageUrl(imageUrl);
        Item createdItem = itemService.createItem(request);
        return new ItemResponse(createdItem);
    }

    @GetMapping("/{id}")
    public ItemResponse getItemById(@PathVariable Long id) {
        return new ItemResponse(itemService.getItemById(id));
    }

    @GetMapping("/{id}/matches")
    public List<ItemResponse> getMatches(@PathVariable Long id) {
        return matchingService.findMatches(id).stream()
                .map(ItemResponse::new)
                .toList();
    }

    @PatchMapping("/{id}/approve")
    public ItemResponse approveItem(@PathVariable Long id, HttpServletRequest request) {
        Item item = itemService.approveItem(id);
        auditLogService.logAdminAction("APPROVE_ITEM", id, request);
        return new ItemResponse(item);
    }

    @PatchMapping("/{id}/reject")
    public ItemResponse rejectItem(@PathVariable Long id, HttpServletRequest request) {
        Item item = itemService.rejectItem(id);
        auditLogService.logAdminAction("REJECT_ITEM", id, request);
        return new ItemResponse(item);
    }

    @PatchMapping("/{id}/return")
    public ItemResponse returnItem(@PathVariable Long id, HttpServletRequest request) {
        Item item = itemService.returnItem(id);
        auditLogService.logAdminAction("RETURN_ITEM", id, request);
        return new ItemResponse(item);
    }
}
