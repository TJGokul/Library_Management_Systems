package com.library.dto;

import com.library.entity.InventoryChangeType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class StockAdjustmentDto {

    @NotNull(message = "Book ID is mandatory")
    private Long bookId;

    @NotNull(message = "Change type is mandatory (ADDITION or REDUCTION)")
    private InventoryChangeType changeType;

    @Min(value = 1, message = "Quantity must be at least 1")
    private int quantity;

    @NotBlank(message = "Reason for stock adjustment is mandatory")
    private String reason;

    public StockAdjustmentDto() {}

    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }
    public InventoryChangeType getChangeType() { return changeType; }
    public void setChangeType(InventoryChangeType changeType) { this.changeType = changeType; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
