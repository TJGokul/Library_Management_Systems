package com.library.config;

import com.library.entity.*;
import com.library.repository.BookRepository;
import com.library.repository.BorrowRecordRepository;
import com.library.repository.InventoryTransactionRepository;
import com.library.repository.MemberRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;

    public DataSeeder(BookRepository bookRepository,
                      MemberRepository memberRepository,
                      BorrowRecordRepository borrowRecordRepository,
                      InventoryTransactionRepository inventoryTransactionRepository) {
        this.bookRepository = bookRepository;
        this.memberRepository = memberRepository;
        this.borrowRecordRepository = borrowRecordRepository;
        this.inventoryTransactionRepository = inventoryTransactionRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (bookRepository.count() > 0) {
            return; // Data already exists
        }

        // 1. Seed Books
        Book b1 = new Book("978-0132350884", "Clean Code: A Handbook of Agile Software Craftsmanship", "Robert C. Martin", "Computer Science", 2008, 5);
        Book b2 = new Book("978-0201633610", "Design Patterns: Elements of Reusable Object-Oriented Software", "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides", "Computer Science", 1994, 3);
        Book b3 = new Book("978-0134685991", "Effective Java", "Joshua Bloch", "Computer Science", 2018, 4);
        Book b4 = new Book("978-0451524935", "1984", "George Orwell", "Classic Fiction", 1949, 6);
        Book b5 = new Book("978-0061120084", "To Kill a Mockingbird", "Harper Lee", "Classic Fiction", 1960, 4);
        Book b6 = new Book("978-0307474278", "The Da Vinci Code", "Dan Brown", "Thriller & Mystery", 2003, 3);
        Book b7 = new Book("978-0062316097", "Sapiens: A Brief History of Humankind", "Yuval Noah Harari", "History & Science", 2014, 5);
        Book b8 = new Book("978-0553380163", "A Brief History of Time", "Stephen Hawking", "Science", 1988, 2);

        List<Book> savedBooks = bookRepository.saveAll(List.of(b1, b2, b3, b4, b5, b6, b7, b8));

        // Record initial inventory logs for each book
        for (Book book : savedBooks) {
            inventoryTransactionRepository.save(new InventoryTransaction(
                    book,
                    InventoryChangeType.INITIAL,
                    book.getTotalCopies(),
                    0,
                    book.getTotalCopies(),
                    0,
                    book.getAvailableCopies(),
                    "Initial library catalog intake"
            ));
        }

        // 2. Seed Members
        Member m1 = new Member("MEM-1001", "Gokulraj T", "gokul@example.com", "+91 98765 43210");
        Member m2 = new Member("MEM-1002", "Sarah Jenkins", "sarah.j@example.com", "+1 415 555 0192");
        Member m3 = new Member("MEM-1003", "David Chen", "david.chen@example.com", "+1 206 555 0148");
        Member m4 = new Member("MEM-1004", "Elena Rostova", "elena.r@example.com", "+44 20 7946 0912");
        Member m5 = new Member("MEM-1005", "Marcus Brody", "marcus.brody@example.com", "+1 312 555 0183");

        memberRepository.saveAll(List.of(m1, m2, m3, m4, m5));

        // 3. Seed Realistic Borrowing Activity
        // Issue b1 to m1 (active loan, issued 2 days ago)
        b1.setAvailableCopies(b1.getAvailableCopies() - 1);
        bookRepository.save(b1);
        BorrowRecord rec1 = new BorrowRecord(
                b1,
                m1,
                LocalDate.now().minusDays(2),
                LocalDate.now().minusDays(2).plusDays(14),
                "Assigned reading for sprint"
        );
        borrowRecordRepository.save(rec1);
        inventoryTransactionRepository.save(new InventoryTransaction(
                b1,
                InventoryChangeType.ISSUE,
                -1,
                b1.getTotalCopies(),
                b1.getTotalCopies(),
                b1.getAvailableCopies() + 1,
                b1.getAvailableCopies(),
                "Book issued to member: " + m1.getName()
        ));

        // Issue b3 to m1 (second book borrowed by m1)
        b3.setAvailableCopies(b3.getAvailableCopies() - 1);
        bookRepository.save(b3);
        BorrowRecord rec2 = new BorrowRecord(
                b3,
                m1,
                LocalDate.now().minusDays(5),
                LocalDate.now().minusDays(5).plusDays(14),
                "Java study group"
        );
        borrowRecordRepository.save(rec2);
        inventoryTransactionRepository.save(new InventoryTransaction(
                b3,
                InventoryChangeType.ISSUE,
                -1,
                b3.getTotalCopies(),
                b3.getTotalCopies(),
                b3.getAvailableCopies() + 1,
                b3.getAvailableCopies(),
                "Book issued to member: " + m1.getName()
        ));

        // Issue b4 to m2 (overdue sample: issued 20 days ago)
        b4.setAvailableCopies(b4.getAvailableCopies() - 1);
        bookRepository.save(b4);
        BorrowRecord rec3 = new BorrowRecord(
                b4,
                m2,
                LocalDate.now().minusDays(20),
                LocalDate.now().minusDays(20).plusDays(14), // due 6 days ago -> overdue!
                "Book club edition"
        );
        borrowRecordRepository.save(rec3);
        inventoryTransactionRepository.save(new InventoryTransaction(
                b4,
                InventoryChangeType.ISSUE,
                -1,
                b4.getTotalCopies(),
                b4.getTotalCopies(),
                b4.getAvailableCopies() + 1,
                b4.getAvailableCopies(),
                "Book issued to member: " + m2.getName()
        ));

        // Seed a returned record
        BorrowRecord rec4 = new BorrowRecord(
                b7,
                m3,
                LocalDate.now().minusDays(30),
                LocalDate.now().minusDays(16),
                "Returned in mint condition"
        );
        rec4.setStatus(BorrowStatus.RETURNED);
        rec4.setReturnDate(LocalDate.now().minusDays(18));
        borrowRecordRepository.save(rec4);
    }
}
