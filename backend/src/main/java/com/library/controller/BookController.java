package com.library.controller;

import com.library.dto.BookRequestDto;
import com.library.dto.BookResponseDto;
import com.library.service.BookService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping
    public ResponseEntity<List<BookResponseDto>> getBooks(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) Boolean availableOnly,
            @RequestParam(required = false, defaultValue = "title") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortOrder) {
        List<BookResponseDto> books = bookService.searchAndFilterBooks(search, genre, availableOnly, sortBy, sortOrder);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookResponseDto> getBookById(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.getBookById(id));
    }

    @GetMapping("/genres")
    public ResponseEntity<List<String>> getGenres() {
        return ResponseEntity.ok(bookService.getAllGenres());
    }

    @PostMapping
    public ResponseEntity<BookResponseDto> createBook(@Valid @RequestBody BookRequestDto dto) {
        BookResponseDto created = bookService.createBook(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookResponseDto> updateBook(@PathVariable Long id, @Valid @RequestBody BookRequestDto dto) {
        return ResponseEntity.ok(bookService.updateBook(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }
}
