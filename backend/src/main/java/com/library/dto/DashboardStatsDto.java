package com.library.dto;

public class DashboardStatsDto {
    private long totalBooks;
    private long totalCopies;
    private long availableCopies;
    private long issuedCopies;
    private long totalMembers;
    private long activeLoans;
    private long overdueLoans;

    public DashboardStatsDto() {}

    public long getTotalBooks() { return totalBooks; }
    public void setTotalBooks(long totalBooks) { this.totalBooks = totalBooks; }
    public long getTotalCopies() { return totalCopies; }
    public void setTotalCopies(long totalCopies) { this.totalCopies = totalCopies; }
    public long getAvailableCopies() { return availableCopies; }
    public void setAvailableCopies(long availableCopies) { this.availableCopies = availableCopies; }
    public long getIssuedCopies() { return issuedCopies; }
    public void setIssuedCopies(long issuedCopies) { this.issuedCopies = issuedCopies; }
    public long getTotalMembers() { return totalMembers; }
    public void setTotalMembers(long totalMembers) { this.totalMembers = totalMembers; }
    public long getActiveLoans() { return activeLoans; }
    public void setActiveLoans(long activeLoans) { this.activeLoans = activeLoans; }
    public long getOverdueLoans() { return overdueLoans; }
    public void setOverdueLoans(long overdueLoans) { this.overdueLoans = overdueLoans; }
}
