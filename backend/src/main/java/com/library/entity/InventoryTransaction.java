package com.library.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_transactions")
public class InventoryTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Enumerated(EnumType.STRING)
    @Column(name = "change_type", nullable = false)
    private InventoryChangeType changeType;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "previous_total", nullable = false)
    private int previousTotal;

    @Column(name = "new_total", nullable = false)
    private int newTotal;

    @Column(name = "previous_available", nullable = false)
    private int previousAvailable;

    @Column(name = "new_available", nullable = false)
    private int newAvailable;

    @Column(nullable = false, length = 500)
    private String reason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public InventoryTransaction() {}

    public InventoryTransaction(Book book, InventoryChangeType changeType, int quantity,
                                int previousTotal, int newTotal,
                                int previousAvailable, int newAvailable, String reason) {
        this.book = book;
        this.changeType = changeType;
        this.quantity = quantity;
        this.previousTotal = previousTotal;
        this.newTotal = newTotal;
        this.previousAvailable = previousAvailable;
        this.newAvailable = newAvailable;
        this.reason = reason;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Book getBook() {
        return book;
    }

    public void setBook(Book book) {
        this.book = book;
    }

    public InventoryChangeType getChangeType() {
        return changeType;
    }

    public void setChangeType(InventoryChangeType changeType) {
        this.changeType = changeType;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public int getPreviousTotal() {
        return previousTotal;
    }

    public void setPreviousTotal(int previousTotal) {
        this.previousTotal = previousTotal;
    }

    public int getNewTotal() {
        return newTotal;
    }

    public void setNewTotal(int newTotal) {
        this.newTotal = newTotal;
    }

    public int getPreviousAvailable() {
        return previousAvailable;
    }

    public void setPreviousAvailable(int previousAvailable) {
        this.previousAvailable = previousAvailable;
    }

    public int getNewAvailable() {
        return newAvailable;
    }

    public void setNewAvailable(int newAvailable) {
        this.newAvailable = newAvailable;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
