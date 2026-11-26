package com.library.service;

import com.library.dto.MemberRequestDto;
import com.library.dto.MemberResponseDto;
import com.library.entity.BorrowRecord;
import com.library.entity.BorrowStatus;
import com.library.entity.Member;
import com.library.entity.MemberStatus;
import com.library.exception.BusinessRuleViolationException;
import com.library.exception.DuplicateResourceException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.BorrowRecordRepository;
import com.library.repository.MemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MemberService {

    private final MemberRepository memberRepository;
    private final BorrowRecordRepository borrowRecordRepository;

    public MemberService(MemberRepository memberRepository, BorrowRecordRepository borrowRecordRepository) {
        this.memberRepository = memberRepository;
        this.borrowRecordRepository = borrowRecordRepository;
    }

    @Transactional
    public MemberResponseDto registerMember(MemberRequestDto dto) {
        String membershipNumber = dto.getMembershipNumber().trim();
        String email = dto.getEmail().trim().toLowerCase();

        if (memberRepository.existsByMembershipNumber(membershipNumber)) {
            throw new DuplicateResourceException("Membership number '" + membershipNumber + "' is already registered.");
        }
        if (memberRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email '" + email + "' is already registered to another member.");
        }

        Member member = new Member(
                membershipNumber,
                dto.getName().trim(),
                email,
                dto.getPhone().trim()
        );
        if (dto.getStatus() != null) {
            member.setStatus(dto.getStatus());
        }

        Member saved = memberRepository.save(member);
        return MemberResponseDto.fromEntity(saved, 0);
    }

    @Transactional
    public MemberResponseDto updateMember(Long id, MemberRequestDto dto) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with ID: " + id));

        String email = dto.getEmail().trim().toLowerCase();
        if (memberRepository.existsByEmailAndIdNot(email, id)) {
            throw new DuplicateResourceException("Email '" + email + "' is already used by another member.");
        }

        member.setName(dto.getName().trim());
        member.setEmail(email);
        member.setPhone(dto.getPhone().trim());
        if (dto.getStatus() != null) {
            member.setStatus(dto.getStatus());
        }

        Member saved = memberRepository.save(member);
        long activeLoans = borrowRecordRepository.countByMemberIdAndStatus(id, BorrowStatus.ISSUED);
        return MemberResponseDto.fromEntity(saved, activeLoans);
    }

    @Transactional(readOnly = true)
    public List<MemberResponseDto> getAllMembers(String query) {
        List<Member> members;
        if (query != null && !query.trim().isEmpty()) {
            members = memberRepository.searchMembers(query.trim());
        } else {
            members = memberRepository.findAll();
        }

        return members.stream().map(m -> {
            long activeLoans = borrowRecordRepository.countByMemberIdAndStatus(m.getId(), BorrowStatus.ISSUED);
            return MemberResponseDto.fromEntity(m, activeLoans);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MemberResponseDto getMemberById(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with ID: " + id));
        long activeLoans = borrowRecordRepository.countByMemberIdAndStatus(id, BorrowStatus.ISSUED);
        return MemberResponseDto.fromEntity(member, activeLoans);
    }

    @Transactional(readOnly = true)
    public List<BorrowRecord> getMemberBorrowHistory(Long memberId) {
        if (!memberRepository.existsById(memberId)) {
            throw new ResourceNotFoundException("Member not found with ID: " + memberId);
        }
        return borrowRecordRepository.findByMemberIdOrderByIssueDateDesc(memberId);
    }

    @Transactional
    public void deleteMember(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with ID: " + id));

        long activeLoans = borrowRecordRepository.countByMemberIdAndStatus(id, BorrowStatus.ISSUED);
        if (activeLoans > 0) {
            throw new BusinessRuleViolationException(
                    "Cannot delete member '" + member.getName() + "' because they have " + activeLoans + " active book loan(s)."
            );
        }

        memberRepository.delete(member);
    }
}
