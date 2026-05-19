package com.example.lostfound.service;

import com.example.lostfound.dto.CreateItemRequest;
import com.example.lostfound.model.Category;
import com.example.lostfound.model.Item;
import com.example.lostfound.model.ItemStatus;
import com.example.lostfound.repository.CategoryRepository;
import com.example.lostfound.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;
    private final CategoryRepository categoryRepository;

    public List<Item> getApprovedItems() {
        return itemRepository.findByStatus(ItemStatus.APPROVED);
    }

    public Item createItem(CreateItemRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Item item = Item.builder()
                .type(request.getType())
                .title(request.getTitle())
                .description(request.getDescription())
                .category(category)
                .location(request.getLocation())
                .eventDate(request.getEventDate())
                .imageUrl(request.getImageUrl())
                .contactName(request.getContactName())
                .contactMethod(request.getContactMethod())
                .contactValue(request.getContactValue())
                .status(ItemStatus.PENDING)
                .build();

        return itemRepository.save(item);
    }

    public Item approveItem(Long id) {
        Item item = getItemById(id);
        item.setStatus(ItemStatus.APPROVED);
        return itemRepository.save(item);
    }

    public Item rejectItem(Long id) {
        Item item = getItemById(id);
        item.setStatus(ItemStatus.REJECTED);
        return itemRepository.save(item);
    }

    public Item returnItem(Long id) {
        Item item = getItemById(id);
        item.setStatus(ItemStatus.RETURNED);
        return itemRepository.save(item);
    }

    private Item getItemById(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
    }
}
