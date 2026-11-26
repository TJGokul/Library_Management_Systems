package com.library.repository;

import com.library.entity.BorrowRecord;
import com.library.entity.BorrowStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {
    List<BorrowRecord> findByMemberIdAndStatus(Long memberId, BorrowStatus status);
    List<BorrowRecord> findByMemberIdOrderByIssueDateDesc(Long memberId);
    long countByMemberIdAndStatus(Long memberId, BorrowStatus status);
    long countByBookIdAndStatus(Long bookId, BorrowStatus status);
    List<BorrowRecord> findByStatusOrderByIssueDateDesc(BorrowStatus status);
    List<BorrowRecord> findAllByOrderByIssueDateDesc();
}
