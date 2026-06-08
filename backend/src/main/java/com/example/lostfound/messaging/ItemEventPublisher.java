package com.example.lostfound.messaging;

import com.example.lostfound.config.RabbitMQConfig;
import com.example.lostfound.model.Item;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;


@Slf4j
@Component
@RequiredArgsConstructor
public class ItemEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishItemCreated(Item item) {
        ItemCreatedEvent event = ItemCreatedEvent.builder()
                .itemId(item.getId())
                .itemType(item.getType())
                .title(item.getTitle())
                .createdAt(LocalDateTime.now())
                .build();

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.ITEMS_EXCHANGE,
                RabbitMQConfig.ROUTING_ITEM_CREATED,
                event
        );

        log.info("[MQ] Published item.created: itemId={} type={} title={}",
                event.getItemId(), event.getItemType(), event.getTitle());
    }
}
