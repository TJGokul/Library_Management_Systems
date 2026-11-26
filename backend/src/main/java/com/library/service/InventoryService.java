package com.library.service;

import com.library.dto.StockAdjustmentDto;
import com.library.entity.Book;
import com.library.entity.BorrowStatus;
import com.library.entity.InventoryChangeType;
import com.library.entity.InventoryTransaction;
import com.library.exception.BusinessRuleViolationException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.BookRepository;
import com.library.repository.BorrowRecordRepository;
import com.library.repository.InventoryTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InventoryService {

    private final BookRepository bookRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;

    public InventoryService(BookRepository bookRepository,
                            BorrowRecordRepository borrowRecordRepository,
                            InventoryTransactionRepository inventoryTransactionRepository) {
        this.bookRepository = bookRepository;
        this.borrowRecordRepository = borrowRecordRepository;
        this.inventoryTransactionRepository = inventoryTransactionRepository;
    }

    @Transactional
    public InventoryTransaction adjustStock(StockAdjustmentDto dto) {
        Book book = bookRepository.findById(dto.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with ID: " + dto.getBookId()));

        if (dto.getQuantity() <= 0) {
            throw new BusinessRuleViolationException("Adjustment quantity must be greater than 0.");
        }

        int prevTotal = book.getTotalCopies();
        int prevAvailable = book.getAvailableCopies();
        int newTotal = prevTotal;
        int newAvailable = prevAvailable;

        long currentlyIssued = borrowRecordRepository.countByBookIdAndStatus(book.getId(), BorrowStatus.ISSUED);

        if (dto.getChangeType() == InventoryChangeType.ADDITION) {
            newTotal = prevTotal + dto.getQuantity();
            newAvailable = prevAvailable + dto.getQuantity();
        } else if (dto.getChangeType() == InventoryChangeType.REDUCTION) {
            // Rule: Stock cannot become negative
            if (prevTotal - dto.getQuantity() < 0 || prevAvailable - dto.getQuantity() < 0) {
                throw new BusinessRuleViolationException(
                        "Cannot reduce stock by " + dto.getQuantity() + ". Available copies (" + prevAvailable + ") is insufficient."
                );
            }

            // Rule: Cannot reduce total below actively borrowed copies
            if (prevTotal - dto.getQuantity() < currentlyIssued) {
                throw new BusinessRuleViolationException(
                        "Cannot reduce total stock to " + (prevTotal - dto.getQuantity()) +
                        " because " + currentlyIssued + " copies are currently borrowed by members."
                );
            }

            newTotal = prevTotal - dto.getQuantity();
            newAvailable = prevAvailable - dto.getQuantity();
        } else {
            throw new BusinessRuleViolationException("Unsupported stock adjustment type: " + dto.getChangeType());
        }

        // Invariant safety assertions
        if (newAvailable > newTotal) {
            throw new BusinessRuleViolationException("Available copies cannot exceed total copies.");
        }
        if (newAvailable < 0 || newTotal < 0) {
            throw new BusinessRuleViolationException("Stock quantities cannot be negative.");
        }

        book.setTotalCopies(newTotal);
        book.setAvailableCopies(newAvailable);
        bookRepository.save(book);

        InventoryTransaction tx = new InventoryTransaction(
                book,
                dto.getChangeType(),
                dto.getChangeType() == InventoryChangeType.ADDITION ? dto.getQuantity() : -dto.getQuantity(),
                prevTotal,
                newTotal,
                prevAvailable,
                newAvailable,
                dto.getReason().trim()
        );

        return inventoryTransactionRepository.save(tx);
    }

    @Transactional(readOnly = true)
    public List<InventoryTransaction> getTransactions(Long bookId) {
        if (bookId != null) {
            return inventoryTransactionRepository.findByBookIdOrderByCreatedAtDesc(bookId);
        }
        return inventoryTransactionRepository.findAllByOrderByCreatedAtDesc();
    }
}
