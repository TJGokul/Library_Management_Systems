package com.library.dto;

import jakarta.validation.constraints.NotNull;

public class IssueRequestDto {

    @NotNull(message = "Book ID is mandatory")
    private Long bookId;

    @NotNull(message = "Member ID is mandatory")
    private Long memberId;

    private String notes;

    public IssueRequestDto() {}

    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }
    public Long getMemberId() { return memberId; }
    public void setMemberId(Long memberId) { this.memberId = memberId; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
