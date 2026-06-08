package com.example.lostfound.messaging;

import com.example.lostfound.config.RabbitMQConfig;
import com.example.lostfound.model.Item;
import com.example.lostfound.service.MatchingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.List;


@Slf4j
@Component
@RequiredArgsConstructor
public class MatchingEventConsumer {

    private final MatchingService matchingService;

    @RabbitListener(queues = RabbitMQConfig.QUEUE_MATCHING)
    public void handleItemCreated(ItemCreatedEvent event) {
        log.info("[MQ] Received item.created: itemId={} type={} title={}",
                event.getItemId(), event.getItemType(), event.getTitle());

        try {
            List<Item> matches = matchingService.findMatches(event.getItemId());

            if (matches.isEmpty()) {
                log.info("[MQ] No matches found for itemId={}", event.getItemId());
            } else {
                log.info("[MQ] Found {} match(es) for itemId={}: {}",
                        matches.size(),
                        event.getItemId(),
                        matches.stream().map(Item::getId).toList());
            }

        } catch (Exception ex) {
            log.error("[MQ] Error processing item.created for itemId={}: {}",
                    event.getItemId(), ex.getMessage(), ex);
            throw ex;
        }
    }
}
