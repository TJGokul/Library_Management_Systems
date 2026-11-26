package com.library.controller;

import com.library.dto.MemberRequestDto;
import com.library.dto.MemberResponseDto;
import com.library.entity.BorrowRecord;
import com.library.service.MemberService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "*")
public class MemberController {

    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    @GetMapping
    public ResponseEntity<List<MemberResponseDto>> getAllMembers(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(memberService.getAllMembers(search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MemberResponseDto> getMemberById(@PathVariable Long id) {
        return ResponseEntity.ok(memberService.getMemberById(id));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<BorrowRecord>> getMemberHistory(@PathVariable Long id) {
        return ResponseEntity.ok(memberService.getMemberBorrowHistory(id));
    }

    @PostMapping
    public ResponseEntity<MemberResponseDto> registerMember(@Valid @RequestBody MemberRequestDto dto) {
        MemberResponseDto created = memberService.registerMember(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MemberResponseDto> updateMember(@PathVariable Long id, @Valid @RequestBody MemberRequestDto dto) {
        return ResponseEntity.ok(memberService.updateMember(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMember(@PathVariable Long id) {
        memberService.deleteMember(id);
        return ResponseEntity.noContent().build();
    }
}
