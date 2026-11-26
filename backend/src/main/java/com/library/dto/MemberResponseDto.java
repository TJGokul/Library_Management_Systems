package com.library.dto;

import com.library.entity.Member;
import com.library.entity.MemberStatus;
import java.time.LocalDateTime;

public class MemberResponseDto {
    private Long id;
    private String membershipNumber;
    private String name;
    private String email;
    private String phone;
    private MemberStatus status;
    private long activeLoansCount;
    private boolean canBorrow;
    private LocalDateTime createdAt;

    public MemberResponseDto() {}

    public static MemberResponseDto fromEntity(Member member, long activeLoansCount) {
        MemberResponseDto dto = new MemberResponseDto();
        dto.setId(member.getId());
        dto.setMembershipNumber(member.getMembershipNumber());
        dto.setName(member.getName());
        dto.setEmail(member.getEmail());
        dto.setPhone(member.getPhone());
        dto.setStatus(member.getStatus());
        dto.setActiveLoansCount(activeLoansCount);
        dto.setCanBorrow(member.getStatus() == MemberStatus.ACTIVE && activeLoansCount < 3);
        dto.setCreatedAt(member.getCreatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getMembershipNumber() { return membershipNumber; }
    public void setMembershipNumber(String membershipNumber) { this.membershipNumber = membershipNumber; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public MemberStatus getStatus() { return status; }
    public void setStatus(MemberStatus status) { this.status = status; }
    public long getActiveLoansCount() { return activeLoansCount; }
    public void setActiveLoansCount(long activeLoansCount) { this.activeLoansCount = activeLoansCount; }
    public boolean isCanBorrow() { return canBorrow; }
    public void setCanBorrow(boolean canBorrow) { this.canBorrow = canBorrow; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
