package com.example.lostfound.repository;

import com.example.lostfound.model.Item;
import com.example.lostfound.model.ItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {

    List<Item> findByStatus(ItemStatus status);
}
