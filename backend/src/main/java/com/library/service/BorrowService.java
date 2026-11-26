package com.library.service;

import com.library.dto.DashboardStatsDto;
import com.library.dto.IssueRequestDto;
import com.library.entity.*;
import com.library.exception.BusinessRuleViolationException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.BookRepository;
import com.library.repository.BorrowRecordRepository;
import com.library.repository.InventoryTransactionRepository;
import com.library.repository.MemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class BorrowService {

    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;

    public BorrowService(BookRepository bookRepository,
                         MemberRepository memberRepository,
                         BorrowRecordRepository borrowRecordRepository,
                         InventoryTransactionRepository inventoryTransactionRepository) {
        this.bookRepository = bookRepository;
        this.memberRepository = memberRepository;
        this.borrowRecordRepository = borrowRecordRepository;
        this.inventoryTransactionRepository = inventoryTransactionRepository;
    }

    @Transactional
    public BorrowRecord issueBook(IssueRequestDto dto) {
        // 1. Validate Book
        Book book = bookRepository.findById(dto.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with ID: " + dto.getBookId()));

        if (book.getAvailableCopies() <= 0) {
            throw new BusinessRuleViolationException(
                    "Book '" + book.getTitle() + "' is out of stock. All " + book.getTotalCopies() + " copies are currently borrowed."
            );
        }

        // 2. Validate Member
        Member member = memberRepository.findById(dto.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with ID: " + dto.getMemberId()));

        if (member.getStatus() != MemberStatus.ACTIVE) {
            throw new BusinessRuleViolationException("Member '" + member.getName() + "' is currently SUSPENDED and cannot borrow books.");
        }

        // 3. Validate 3-Book Limit
        long activeBorrowCount = borrowRecordRepository.countByMemberIdAndStatus(member.getId(), BorrowStatus.ISSUED);
        if (activeBorrowCount >= 3) {
            throw new BusinessRuleViolationException(
                    "Borrowing limit exceeded: Member '" + member.getName() +
                    "' already has " + activeBorrowCount + " borrowed books. The maximum allowed limit is 3 books."
            );
        }

        // 4. Update book inventory atomically
        int prevAvailable = book.getAvailableCopies();
        int newAvailable = prevAvailable - 1;
        book.setAvailableCopies(newAvailable);
        bookRepository.save(book);

        // 5. Create borrowing record with 14-day duration
        LocalDate issueDate = LocalDate.now();
        LocalDate dueDate = issueDate.plusDays(14);

        BorrowRecord record = new BorrowRecord(
                book,
                member,
                issueDate,
                dueDate,
                dto.getNotes() != null ? dto.getNotes().trim() : null
        );
        BorrowRecord savedRecord = borrowRecordRepository.save(record);

        // 6. Record inventory transaction audit
        InventoryTransaction tx = new InventoryTransaction(
                book,
                InventoryChangeType.ISSUE,
                -1,
                book.getTotalCopies(),
                book.getTotalCopies(),
                prevAvailable,
                newAvailable,
                "Book issued to member: " + member.getName() + " (" + member.getMembershipNumber() + ")"
        );
        inventoryTransactionRepository.save(tx);

        return savedRecord;
    }

    @Transactional
    public BorrowRecord returnBook(Long borrowRecordId, String notes) {
        BorrowRecord record = borrowRecordRepository.findById(borrowRecordId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrowing record not found with ID: " + borrowRecordId));

        if (record.getStatus() == BorrowStatus.RETURNED) {
            throw new BusinessRuleViolationException("This book has already been marked as returned on " + record.getReturnDate());
        }

        Book book = record.getBook();
        int prevAvailable = book.getAvailableCopies();
        int newAvailable = prevAvailable + 1;

        // Invariant: Available stock cannot exceed total stock
        if (newAvailable > book.getTotalCopies()) {
            throw new BusinessRuleViolationException(
                    "Inconsistent stock state: Available copies (" + newAvailable + ") cannot exceed total copies (" + book.getTotalCopies() + ")."
            );
        }

        // 1. Update book inventory
        book.setAvailableCopies(newAvailable);
        bookRepository.save(book);

        // 2. Update borrowing record
        record.setStatus(BorrowStatus.RETURNED);
        record.setReturnDate(LocalDate.now());
        if (notes != null && !notes.trim().isEmpty()) {
            String updatedNotes = record.getNotes() != null ? record.getNotes() + " | " + notes.trim() : notes.trim();
            record.setNotes(updatedNotes);
        }
        BorrowRecord updatedRecord = borrowRecordRepository.save(record);

        // 3. Record inventory transaction audit
        InventoryTransaction tx = new InventoryTransaction(
                book,
                InventoryChangeType.RETURN,
                1,
                book.getTotalCopies(),
                book.getTotalCopies(),
                prevAvailable,
                newAvailable,
                "Book returned by member: " + record.getMember().getName() + " (" + record.getMember().getMembershipNumber() + ")"
        );
        inventoryTransactionRepository.save(tx);

        return updatedRecord;
    }

    @Transactional(readOnly = true)
    public List<BorrowRecord> getBorrowings(BorrowStatus status, Long memberId) {
        List<BorrowRecord> records;
        if (memberId != null) {
            records = borrowRecordRepository.findByMemberIdOrderByIssueDateDesc(memberId);
        } else if (status != null) {
            records = borrowRecordRepository.findByStatusOrderByIssueDateDesc(status);
        } else {
            records = borrowRecordRepository.findAllByOrderByIssueDateDesc();
        }

        // Update overdue virtual status if status is ISSUED and dueDate < today
        LocalDate today = LocalDate.now();
        for (BorrowRecord r : records) {
            if (r.getStatus() == BorrowStatus.ISSUED && r.getDueDate().isBefore(today)) {
                r.setStatus(BorrowStatus.OVERDUE);
            }
        }

        return records;
    }

    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        List<Book> books = bookRepository.findAll();
        long totalBooks = books.size();
        long totalCopies = books.stream().mapToLong(Book::getTotalCopies).sum();
        long availableCopies = books.stream().mapToLong(Book::getAvailableCopies).sum();
        long issuedCopies = Math.max(0, totalCopies - availableCopies);

        long totalMembers = memberRepository.count();

        List<BorrowRecord> activeRecords = borrowRecordRepository.findByStatusOrderByIssueDateDesc(BorrowStatus.ISSUED);
        long activeLoans = activeRecords.size();
        LocalDate today = LocalDate.now();
        long overdueLoans = activeRecords.stream().filter(r -> r.getDueDate().isBefore(today)).count();

        DashboardStatsDto stats = new DashboardStatsDto();
        stats.setTotalBooks(totalBooks);
        stats.setTotalCopies(totalCopies);
        stats.setAvailableCopies(availableCopies);
        stats.setIssuedCopies(issuedCopies);
        stats.setTotalMembers(totalMembers);
        stats.setActiveLoans(activeLoans);
        stats.setOverdueLoans(overdueLoans);

        return stats;
    }
}
