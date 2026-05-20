package com.example.lostfound.service;

import com.example.lostfound.model.Item;
import com.example.lostfound.model.ItemStatus;
import com.example.lostfound.model.ItemType;
import com.example.lostfound.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class MatchingService {

    private final ItemRepository itemRepository;

    private static final Set<String> STOP_WORDS = new HashSet<>(Arrays.asList(
            "и", "в", "на", "под", "с", "у", "я", "мы", "привет", "пожалуйста", "потерял", "нашел", "цвет"
    ));

    public List<Item> findMatches(Long id) {
        Item currentItem = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        ItemType oppositeType = currentItem.getType() == ItemType.LOST
                ? ItemType.FOUND
                : ItemType.LOST;

        List<Item> oppositeItems = itemRepository.findByTypeAndStatus(oppositeType, ItemStatus.APPROVED);

        oppositeItems.sort((item1, item2) -> {
            int score1 = calculateScore(currentItem, item1);
            int score2 = calculateScore(currentItem, item2);
            return Integer.compare(score2, score1);
        });

        return oppositeItems;
    }

    public int calculateScore(Item lostItem, Item foundItem) {
        int score = 0;

        if (lostItem.getCategory() != null && foundItem.getCategory() != null) {
            if (lostItem.getCategory().getId().equals(foundItem.getCategory().getId())) {
                score += 40;
            }
        }

        String lostText = lostItem.getTitle() + " " + lostItem.getDescription();
        String foundText = foundItem.getTitle() + " " + foundItem.getDescription();

        Set<String> lostWords = prepareWords(lostText);
        Set<String> foundWords = prepareWords(foundText);

        for (String word : lostWords) {
            if (foundWords.contains(word)) {
                score += 20;
            }
        }

        return score;
    }

    private Set<String> prepareWords(String text) {
        if (text == null) return new HashSet<>();

        String clean = text.toLowerCase().replaceAll("[^a-zA-Zа-яА-Я0-9\\s]", "");

        String[] allWords = clean.split("\\s+");

        Set<String> finalWords = new HashSet<>();
        for (String word : allWords) {
            if (!word.isEmpty() && !STOP_WORDS.contains(word)) {
                finalWords.add(word);
            }
        }
        return finalWords;
    }
}