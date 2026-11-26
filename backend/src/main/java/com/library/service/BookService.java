package com.library.service;

import com.library.dto.BookRequestDto;
import com.library.dto.BookResponseDto;
import com.library.entity.Book;
import com.library.entity.BorrowStatus;
import com.library.entity.InventoryChangeType;
import com.library.entity.InventoryTransaction;
import com.library.exception.BusinessRuleViolationException;
import com.library.exception.DuplicateResourceException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.BookRepository;
import com.library.repository.BorrowRecordRepository;
import com.library.repository.InventoryTransactionRepository;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;

    public BookService(BookRepository bookRepository,
                       BorrowRecordRepository borrowRecordRepository,
                       InventoryTransactionRepository inventoryTransactionRepository) {
        this.bookRepository = bookRepository;
        this.borrowRecordRepository = borrowRecordRepository;
        this.inventoryTransactionRepository = inventoryTransactionRepository;
    }

    @Transactional
    public BookResponseDto createBook(BookRequestDto dto) {
        if (bookRepository.existsByIsbn(dto.getIsbn().trim())) {
            throw new DuplicateResourceException("A book with ISBN '" + dto.getIsbn().trim() + "' already exists.");
        }

        if (dto.getTotalCopies() < 1) {
            throw new BusinessRuleViolationException("A new book must have at least 1 copy.");
        }

        Book book = new Book(
                dto.getIsbn().trim(),
                dto.getTitle().trim(),
                dto.getAuthor().trim(),
                dto.getGenre().trim(),
                dto.getPublishedYear(),
                dto.getTotalCopies()
        );
        Book savedBook = bookRepository.save(book);

        // Record initial inventory entry
        InventoryTransaction tx = new InventoryTransaction(
                savedBook,
                InventoryChangeType.INITIAL,
                savedBook.getTotalCopies(),
                0,
                savedBook.getTotalCopies(),
                0,
                savedBook.getAvailableCopies(),
                "Initial catalog addition of " + savedBook.getTotalCopies() + " copies"
        );
        inventoryTransactionRepository.save(tx);

        return BookResponseDto.fromEntity(savedBook);
    }

    @Transactional
    public BookResponseDto updateBook(Long id, BookRequestDto dto) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with ID: " + id));

        if (bookRepository.existsByIsbnAndIdNot(dto.getIsbn().trim(), id)) {
            throw new DuplicateResourceException("Another book already uses ISBN: " + dto.getIsbn().trim());
        }

        book.setIsbn(dto.getIsbn().trim());
        book.setTitle(dto.getTitle().trim());
        book.setAuthor(dto.getAuthor().trim());
        book.setGenre(dto.getGenre().trim());
        book.setPublishedYear(dto.getPublishedYear());

        Book updated = bookRepository.save(book);
        return BookResponseDto.fromEntity(updated);
    }

    @Transactional
    public void deleteBook(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with ID: " + id));

        long activeIssued = borrowRecordRepository.countByBookIdAndStatus(id, BorrowStatus.ISSUED);
        if (activeIssued > 0) {
            throw new BusinessRuleViolationException(
                    "Cannot delete '" + book.getTitle() + "' because " + activeIssued + " copy/copies are currently borrowed."
            );
        }

        // Delete inventory history first to maintain foreign key integrity
        List<InventoryTransaction> transactions = inventoryTransactionRepository.findByBookIdOrderByCreatedAtDesc(id);
        inventoryTransactionRepository.deleteAll(transactions);

        bookRepository.delete(book);
    }

    @Transactional(readOnly = true)
    public BookResponseDto getBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with ID: " + id));
        return BookResponseDto.fromEntity(book);
    }

    @Transactional(readOnly = true)
    public List<BookResponseDto> searchAndFilterBooks(String query, String genre, Boolean availableOnly, String sortBy, String sortOrder) {
        Specification<Book> spec = Specification.where(null);

        if (query != null && !query.trim().isEmpty()) {
            String q = "%" + query.trim().toLowerCase() + "%";
            spec = spec.and((root, criteriaQuery, cb) ->
                    cb.or(
                            cb.like(cb.lower(root.get("title")), q),
                            cb.like(cb.lower(root.get("author")), q),
                            cb.like(cb.lower(root.get("isbn")), q),
                            cb.like(cb.lower(root.get("genre")), q)
                    )
            );
        }

        if (genre != null && !genre.trim().isEmpty() && !genre.equalsIgnoreCase("ALL")) {
            spec = spec.and((root, criteriaQuery, cb) ->
                    cb.equal(cb.lower(root.get("genre")), genre.trim().toLowerCase())
            );
        }

        if (Boolean.TRUE.equals(availableOnly)) {
            spec = spec.and((root, criteriaQuery, cb) ->
                    cb.greaterThan(root.get("availableCopies"), 0)
            );
        }

        // Default sort by title asc
        String validSortBy = "title";
        if (sortBy != null) {
            String clean = sortBy.trim().toLowerCase();
            if (clean.equals("author") || clean.equals("publishedyear") || clean.equals("totalcopies") || clean.equals("availablecopies")) {
                validSortBy = clean.equals("publishedyear") ? "publishedYear" :
                              clean.equals("totalcopies") ? "totalCopies" :
                              clean.equals("availablecopies") ? "availableCopies" : clean;
            }
        }

        Sort.Direction direction = (sortOrder != null && sortOrder.equalsIgnoreCase("desc"))
                ? Sort.Direction.DESC : Sort.Direction.ASC;

        List<Book> books = bookRepository.findAll(spec, Sort.by(direction, validSortBy));
        return books.stream().map(BookResponseDto::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> getAllGenres() {
        return bookRepository.findAll().stream()
                .map(Book::getGenre)
                .filter(g -> g != null && !g.isBlank())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }
}
