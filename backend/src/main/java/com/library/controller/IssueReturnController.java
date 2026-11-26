package com.library.controller;

import com.library.dto.DashboardStatsDto;
import com.library.dto.IssueRequestDto;
import com.library.entity.BorrowRecord;
import com.library.entity.BorrowStatus;
import com.library.service.BorrowService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class IssueReturnController {

    private final BorrowService borrowService;

    public IssueReturnController(BorrowService borrowService) {
        this.borrowService = borrowService;
    }

    @PostMapping("/issues")
    public ResponseEntity<BorrowRecord> issueBook(@Valid @RequestBody IssueRequestDto dto) {
        BorrowRecord record = borrowService.issueBook(dto);
        return new ResponseEntity<>(record, HttpStatus.CREATED);
    }

    @PostMapping("/returns/{id}")
    public ResponseEntity<BorrowRecord> returnBook(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> payload) {
        String notes = (payload != null && payload.containsKey("notes")) ? payload.get("notes") : null;
        BorrowRecord record = borrowService.returnBook(id, notes);
        return ResponseEntity.ok(record);
    }

    @GetMapping("/issues")
    public ResponseEntity<List<BorrowRecord>> getBorrowRecords(
            @RequestParam(required = false) BorrowStatus status,
            @RequestParam(required = false) Long memberId) {
        return ResponseEntity.ok(borrowService.getBorrowings(status, memberId));
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        return ResponseEntity.ok(borrowService.getDashboardStats());
    }
}
