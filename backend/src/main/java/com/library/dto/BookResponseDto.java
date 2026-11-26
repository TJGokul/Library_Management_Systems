package com.library.dto;

import com.library.entity.Book;
import java.time.LocalDateTime;

public class BookResponseDto {
    private Long id;
    private String isbn;
    private String title;
    private String author;
    private String genre;
    private Integer publishedYear;
    private int totalCopies;
    private int availableCopies;
    private int issuedCopies;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public BookResponseDto() {}

    public static BookResponseDto fromEntity(Book book) {
        BookResponseDto dto = new BookResponseDto();
        dto.setId(book.getId());
        dto.setIsbn(book.getIsbn());
        dto.setTitle(book.getTitle());
        dto.setAuthor(book.getAuthor());
        dto.setGenre(book.getGenre());
        dto.setPublishedYear(book.getPublishedYear());
        dto.setTotalCopies(book.getTotalCopies());
        dto.setAvailableCopies(book.getAvailableCopies());
        dto.setIssuedCopies(Math.max(0, book.getTotalCopies() - book.getAvailableCopies()));
        dto.setCreatedAt(book.getCreatedAt());
        dto.setUpdatedAt(book.getUpdatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }
    public Integer getPublishedYear() { return publishedYear; }
    public void setPublishedYear(Integer publishedYear) { this.publishedYear = publishedYear; }
    public int getTotalCopies() { return totalCopies; }
    public void setTotalCopies(int totalCopies) { this.totalCopies = totalCopies; }
    public int getAvailableCopies() { return availableCopies; }
    public void setAvailableCopies(int availableCopies) { this.availableCopies = availableCopies; }
    public int getIssuedCopies() { return issuedCopies; }
    public void setIssuedCopies(int issuedCopies) { this.issuedCopies = issuedCopies; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
