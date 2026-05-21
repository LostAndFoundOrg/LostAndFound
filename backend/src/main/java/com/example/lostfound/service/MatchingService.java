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
import java.util.List;

@Service
public class MatchingService {

    private final ItemRepository itemRepository;

    @Value("${gemini.api.key}")
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

        return oppositeItems.stream()
                .filter(item -> calculateScore(currentItem, item) >= 30)
                .sorted((item1, item2) -> {
                    int score1 = calculateScore(currentItem, item1);
                    int score2 = calculateScore(currentItem, item2);
                    return Integer.compare(score2, score1);
                })
                .toList();
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

        int aiScore = getAiTextScore(lostText, foundText);

        score += aiScore;

        return score;
    }

    private int getAiTextScore(String lostText, String foundText) {
        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;

            String prompt = String.format(
                    "Сравни два описания объявлений бюро находок. " +
                            "Первое: '%s'. Второе: '%s'. " +
                            "Оцени, насколько вероятно, что это одна и та же вещь. " +
                            "Ответь СТРОГО одной цифрой от 0 до 60, где 0 — абсолютно разные вещи, а 60 — точно одна и та же вещь (учитывай синонимы и контекст). " +
                            "Никакого лишнего текста, только цифра.",
                    lostText.replace("\"", "\\\""), foundText.replace("\"", "\\\"")
            );

            String jsonRequestBody = "{\n" +
                    "  \"contents\": [{\n" +
                    "    \"parts\": [{\n" +
                    "      \"text\": \"" + prompt + "\"\n" +
                    "    }]\n" +
                    "  }]\n" +
                    "}\n";

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonRequestBody))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            String responseBody = response.body();

            if (responseBody != null && responseBody.contains("\"text\": \"")) {
                int startIndex = responseBody.indexOf("\"text\": \"") + 9;
                int endIndex = responseBody.indexOf("\"", startIndex);
                String aiNumberStr = responseBody.substring(startIndex, endIndex).trim();

                return Integer.parseInt(aiNumberStr);
            }

        } catch (Exception e) {
            System.err.println("Ошибка при запросе к Gemini API: " + e.getMessage());
        }

        return 0;
    }
}
