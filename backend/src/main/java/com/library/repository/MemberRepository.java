package com.library.repository;

import com.library.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByMembershipNumber(String membershipNumber);
    Optional<Member> findByEmail(String email);
    boolean existsByMembershipNumber(String membershipNumber);
    boolean existsByEmail(String email);
    boolean existsByEmailAndIdNot(String email, Long id);

    @Query("SELECT m FROM Member m WHERE " +
           "LOWER(m.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.membershipNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.phone) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Member> searchMembers(@Param("query") String query);
}
