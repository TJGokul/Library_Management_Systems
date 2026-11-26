package com.library.repository;

import com.library.entity.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    List<InventoryTransaction> findByBookIdOrderByCreatedAtDesc(Long bookId);
    List<InventoryTransaction> findAllByOrderByCreatedAtDesc();
}
