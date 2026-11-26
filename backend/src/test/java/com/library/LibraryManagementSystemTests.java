package com.library;

import com.library.dto.BookRequestDto;
import com.library.dto.IssueRequestDto;
import com.library.dto.MemberRequestDto;
import com.library.dto.StockAdjustmentDto;
import com.library.entity.*;
import com.library.exception.BusinessRuleViolationException;
import com.library.exception.DuplicateResourceException;
import com.library.repository.BookRepository;
import com.library.repository.BorrowRecordRepository;
import com.library.repository.InventoryTransactionRepository;
import com.library.repository.MemberRepository;
import com.library.service.BookService;
import com.library.service.BorrowService;
import com.library.service.InventoryService;
import com.library.service.MemberService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("h2")
@Transactional
class LibraryManagementSystemTests {

    @Autowired
    private BookService bookService;

    @Autowired
    private MemberService memberService;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private BorrowService borrowService;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private BorrowRecordRepository borrowRecordRepository;

    @Autowired
    private InventoryTransactionRepository inventoryTransactionRepository;

    private Book testBook;
    private Member testMember;

    @BeforeEach
    void setUp() {
        // Clear tables for controlled test environment
        borrowRecordRepository.deleteAll();
        inventoryTransactionRepository.deleteAll();
        bookRepository.deleteAll();
        memberRepository.deleteAll();

        BookRequestDto bookDto = new BookRequestDto();
        bookDto.setIsbn("978-0000000001");
        bookDto.setTitle("Test-Driven Development");
        bookDto.setAuthor("Kent Beck");
        bookDto.setGenre("Computer Science");
        bookDto.setPublishedYear(2002);
        bookDto.setTotalCopies(3);
        bookService.createBook(bookDto);
        testBook = bookRepository.findByIsbn("978-0000000001").orElseThrow();

        MemberRequestDto memberDto = new MemberRequestDto();
        memberDto.setMembershipNumber("MEM-9999");
        memberDto.setName("Alice Engineer");
        memberDto.setEmail("alice@test.com");
        memberDto.setPhone("+1 555 999 8888");
        memberService.registerMember(memberDto);
        testMember = memberRepository.findByMembershipNumber("MEM-9999").orElseThrow();
    }

    @Test
    @DisplayName("Rule 1: Every book must have a unique ISBN")
    void testUniqueIsbnEnforcement() {
        BookRequestDto duplicateDto = new BookRequestDto();
        duplicateDto.setIsbn("978-0000000001"); // same ISBN
        duplicateDto.setTitle("Duplicate Title");
        duplicateDto.setAuthor("Author Two");
        duplicateDto.setGenre("Fiction");
        duplicateDto.setTotalCopies(2);

        assertThrows(DuplicateResourceException.class, () -> bookService.createBook(duplicateDto));
    }

    @Test
    @DisplayName("Rule 2 & 3: Stock quantities cannot become negative")
    void testNegativeStockRejection() {
        StockAdjustmentDto adjustment = new StockAdjustmentDto();
        adjustment.setBookId(testBook.getId());
        adjustment.setChangeType(InventoryChangeType.REDUCTION);
        adjustment.setQuantity(10); // Exceeds 3 available
        adjustment.setReason("Excess write-off");

        assertThrows(BusinessRuleViolationException.class, () -> inventoryService.adjustStock(adjustment));
    }

    @Test
    @DisplayName("Rule 4: A member can borrow a maximum of 3 books simultaneously")
    void testMaxThreeBooksLimit() {
        // Create 3 extra books
        Book b1 = bookRepository.save(new Book("978-0000000002", "Book 2", "Author", "Genre", 2020, 2));
        Book b2 = bookRepository.save(new Book("978-0000000003", "Book 3", "Author", "Genre", 2020, 2));
        Book b3 = bookRepository.save(new Book("978-0000000004", "Book 4", "Author", "Genre", 2020, 2));

        // Borrow 1st book
        IssueRequestDto req1 = new IssueRequestDto();
        req1.setBookId(testBook.getId());
        req1.setMemberId(testMember.getId());
        borrowService.issueBook(req1);

        // Borrow 2nd book
        IssueRequestDto req2 = new IssueRequestDto();
        req2.setBookId(b1.getId());
        req2.setMemberId(testMember.getId());
        borrowService.issueBook(req2);

        // Borrow 3rd book
        IssueRequestDto req3 = new IssueRequestDto();
        req3.setBookId(b2.getId());
        req3.setMemberId(testMember.getId());
        borrowService.issueBook(req3);

        // Attempt to borrow 4th book -> MUST BE REJECTED!
        IssueRequestDto req4 = new IssueRequestDto();
        req4.setBookId(b3.getId());
        req4.setMemberId(testMember.getId());

        BusinessRuleViolationException exception = assertThrows(
                BusinessRuleViolationException.class,
                () -> borrowService.issueBook(req4)
        );
        assertTrue(exception.getMessage().contains("maximum allowed limit is 3 books"));
    }

    @Test
    @DisplayName("Rule 5: Default borrowing duration is 14 days")
    void testDefaultFourteenDaysLoanDuration() {
        IssueRequestDto req = new IssueRequestDto();
        req.setBookId(testBook.getId());
        req.setMemberId(testMember.getId());

        BorrowRecord record = borrowService.issueBook(req);

        assertEquals(LocalDate.now(), record.getIssueDate());
        assertEquals(LocalDate.now().plusDays(14), record.getDueDate());
        assertEquals(BorrowStatus.ISSUED, record.getStatus());
    }

    @Test
    @DisplayName("Rule 6: Issuing and returning books updates inventory quantities correctly")
    void testIssueAndReturnInventoryUpdates() {
        int initialAvailable = testBook.getAvailableCopies(); // 3

        // Issue book
        IssueRequestDto issueReq = new IssueRequestDto();
        issueReq.setBookId(testBook.getId());
        issueReq.setMemberId(testMember.getId());
        BorrowRecord record = borrowService.issueBook(issueReq);

        Book updatedBookAfterIssue = bookRepository.findById(testBook.getId()).orElseThrow();
        assertEquals(initialAvailable - 1, updatedBookAfterIssue.getAvailableCopies()); // 2

        // Return book
        borrowService.returnBook(record.getId(), "Returned in good condition");

        Book updatedBookAfterReturn = bookRepository.findById(testBook.getId()).orElseThrow();
        assertEquals(initialAvailable, updatedBookAfterReturn.getAvailableCopies()); // 3
        assertEquals(BorrowStatus.RETURNED, borrowRecordRepository.findById(record.getId()).orElseThrow().getStatus());
    }

    @Test
    @DisplayName("Rule 7: All stock changes maintain transaction history")
    void testInventoryTransactionAuditHistory() {
        // Initial book creation recorded 1 transaction
        List<InventoryTransaction> transactions = inventoryTransactionRepository.findByBookIdOrderByCreatedAtDesc(testBook.getId());
        assertFalse(transactions.isEmpty());
        assertEquals(InventoryChangeType.INITIAL, transactions.get(0).getChangeType());

        // Stock addition
        StockAdjustmentDto addDto = new StockAdjustmentDto();
        addDto.setBookId(testBook.getId());
        addDto.setChangeType(InventoryChangeType.ADDITION);
        addDto.setQuantity(2);
        addDto.setReason("New batch received");
        inventoryService.adjustStock(addDto);

        // Issue book
        IssueRequestDto issueReq = new IssueRequestDto();
        issueReq.setBookId(testBook.getId());
        issueReq.setMemberId(testMember.getId());
        borrowService.issueBook(issueReq);

        List<InventoryTransaction> updatedTxList = inventoryTransactionRepository.findByBookIdOrderByCreatedAtDesc(testBook.getId());
        assertEquals(3, updatedTxList.size()); // INITIAL + ADDITION + ISSUE
    }
}
