package com.example.lostfound.service;

import com.example.lostfound.model.Item;
import com.example.lostfound.model.ItemStatus;
import com.example.lostfound.model.ItemType;
import com.example.lostfound.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Comparator;
import java.util.List;

@Service
public class MatchingService {

    private final ItemRepository itemRepository;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    public MatchingService(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    public List<Item> findMatches(Long id) {
        Item currentItem = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        ItemType oppositeType = currentItem.getType() == ItemType.LOST
                ? ItemType.FOUND
                : ItemType.LOST;

        List<Item> oppositeItems = itemRepository.findByTypeAndStatus(oppositeType, ItemStatus.APPROVED);

      
        record ScoredItem(Item item, int score) {}

        return oppositeItems.stream()
                .map(item -> new ScoredItem(item, calculateScore(currentItem, item)))
                .filter(si -> si.score() >= 30)
                .sorted(Comparator.comparingInt(ScoredItem::score).reversed())
                .map(ScoredItem::item)
                .toList();
    }

    public int calculateScore(Item item1, Item item2) {
        int score = 0;

      
        if (item1.getCategory() != null && item2.getCategory() != null) {
            if (item1.getCategory().getId().equals(item2.getCategory().getId())) {
                score += 40;
            }
        }

       
        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            String text1 = item1.getTitle() + " " + item1.getDescription();
            String text2 = item2.getTitle() + " " + item2.getDescription();
            score += getAiTextScore(text1, text2);
        }

        return score;
    }

    private int getAiTextScore(String text1, String text2) {
        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;

          
            String safeText1 = text1.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", " ").replace("\r", "");
            String safeText2 = text2.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", " ").replace("\r", "");

            String prompt = "Compare these two lost-and-found item descriptions and estimate the probability they are the same item. " +
                    "First: '" + safeText1 + "'. Second: '" + safeText2 + "'. " +
                    "Reply with ONLY a single integer from 0 to 60. 0 = completely different, 60 = definitely the same item. No other text.";

            String jsonBody = "{\"contents\":[{\"parts\":[{\"text\":\"" + prompt + "\"}]}]}";

            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(5))
                    .build();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(8))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            String body = response.body();

            System.out.println("Gemini response: " + body);

            
            if (body != null && body.contains("\"text\":")) {
                int textIdx = body.indexOf("\"text\":") + 7;
                
                while (textIdx < body.length() && (body.charAt(textIdx) == ' ' || body.charAt(textIdx) == '"')) {
                    textIdx++;
                }
                StringBuilder digits = new StringBuilder();
                while (textIdx < body.length() && Character.isDigit(body.charAt(textIdx))) {
                    digits.append(body.charAt(textIdx));
                    textIdx++;
                }
                if (digits.length() > 0) {
                    int aiScore = Integer.parseInt(digits.toString());
                    
                    return Math.max(0, Math.min(60, aiScore));
                }
            }

        } catch (Exception e) {
            System.err.println("Gemini API error: " + e.getMessage());
        }

        return 0;
    }
}
