package com.example.lostfound.controller;

import com.example.lostfound.dto.CreateItemRequest;
import com.example.lostfound.dto.ItemResponse;
import com.example.lostfound.model.Item;
import com.example.lostfound.service.CloudinaryService;
import com.example.lostfound.service.ItemService;
import com.example.lostfound.service.MatchingService;
import jakarta.validation.Valid;
import com.example.lostfound.security.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
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

   
    @GetMapping("/{id}")
    public ItemResponse getItemById(@PathVariable Long id) {
        Item item = itemService.getItemById(id);
        return new ItemResponse(item);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ItemResponse createItem(
            @Valid @ModelAttribute CreateItemRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        if (image != null && !image.isEmpty()) {
            String uploadedUrl = cloudinaryService.uploadItemPhoto(image);
            request.setImageUrl(uploadedUrl);
        }

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
