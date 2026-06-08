package com.example.lostfound.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class RabbitMQConfig {


    public static final String ITEMS_EXCHANGE      = "lostfound.items";
    public static final String ROUTING_ITEM_CREATED = "item.created";
    public static final String QUEUE_MATCHING      = "lostfound.items.matching";
    public static final String QUEUE_MATCHING_DLQ  = "lostfound.items.matching.dlq";
    private static final String DLX = "lostfound.dlx";



    @Bean
    public TopicExchange itemsExchange() {
        return ExchangeBuilder
                .topicExchange(ITEMS_EXCHANGE)
                .durable(true)
                .build();
    }

    @Bean
    public DirectExchange deadLetterExchange() {
        return ExchangeBuilder
                .directExchange(DLX)
                .durable(true)
                .build();
    }



    @Bean
    public Queue matchingQueue() {
        return QueueBuilder
                .durable(QUEUE_MATCHING)
                .withArgument("x-dead-letter-exchange", DLX)
                .withArgument("x-dead-letter-routing-key", QUEUE_MATCHING_DLQ)
                .build();
    }

    @Bean
    public Queue matchingDlq() {
        return QueueBuilder
                .durable(QUEUE_MATCHING_DLQ)
                .build();
    }



    @Bean
    public Binding matchingBinding(Queue matchingQueue, TopicExchange itemsExchange) {
        return BindingBuilder
                .bind(matchingQueue)
                .to(itemsExchange)
                .with(ROUTING_ITEM_CREATED);
    }

    @Bean
    public Binding dlqBinding(Queue matchingDlq, DirectExchange deadLetterExchange) {
        return BindingBuilder
                .bind(matchingDlq)
                .to(deadLetterExchange)
                .with(QUEUE_MATCHING_DLQ);
    }



    @Bean
    public MessageConverter jsonMessageConverter() {
        return new JacksonJsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory cf,
                                         MessageConverter jsonMessageConverter) {
        RabbitTemplate template = new RabbitTemplate(cf);
        template.setMessageConverter(jsonMessageConverter);
        return template;
    }
}
