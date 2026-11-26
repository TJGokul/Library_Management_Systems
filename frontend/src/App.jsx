import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';
import { BookModal } from './components/BookModal';
import { StockModal } from './components/StockModal';
import { MemberModal } from './components/MemberModal';
import { MemberHistoryModal } from './components/MemberHistoryModal';
import { ReturnModal } from './components/ReturnModal';

import { DashboardView } from './pages/DashboardView';
import { BooksView } from './pages/BooksView';
import { IssuesView } from './pages/IssuesView';
import { MembersView } from './pages/MembersView';
import { InventoryView } from './pages/InventoryView';

import { api } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Core Data
  const [stats, setStats] = useState(null);
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [members, setMembers] = useState([]);
  const [borrowRecords, setBorrowRecords] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Book Filter & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('ALL');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');

  // Modals
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockBook, setStockBook] = useState(null);

  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyMember, setHistoryMember] = useState(null);

  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returningRecord, setReturningRecord] = useState(null);

  const [preselectedBook, setPreselectedBook] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  }, []);

  // Fetch all initial data
  const refreshData = useCallback(async () => {
    try {
      const [statsData, booksData, genresData, membersData, recordsData, txData] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getBooks({
          search: searchQuery,
          genre: selectedGenre,
          availableOnly,
          sortBy,
          sortOrder,
        }).catch(() => []),
        api.getGenres().catch(() => []),
        api.getMembers().catch(() => []),
        api.getBorrowings().catch(() => []),
        api.getInventoryTransactions().catch(() => []),
      ]);

      if (statsData) setStats(statsData);
      setBooks(booksData || []);
      setGenres(genresData || []);
      setMembers(membersData || []);
      setBorrowRecords(recordsData || []);
      setTransactions(txData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedGenre, availableOnly, sortBy, sortOrder]);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Handle Book Actions
  const handleSaveBook = async (bookData) => {
    if (editingBook) {
      await api.updateBook(editingBook.id, bookData);
      showToast(`'${bookData.title}' updated successfully!`);
    } else {
      await api.createBook(bookData);
      showToast(`'${bookData.title}' added to catalog and inventory!`);
    }
    refreshData();
  };

  const handleDeleteBook = async (bookId) => {
    try {
      await api.deleteBook(bookId);
      showToast('Book removed from library catalog.', 'success');
      refreshData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Stock Adjustments
  const handleStockAdjustment = async (adjustmentData) => {
    try {
      await api.adjustStock(adjustmentData);
      showToast('Stock quantity updated and transaction recorded.');
      refreshData();
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  // Handle Member Actions
  const handleSaveMember = async (memberData) => {
    if (editingMember) {
      await api.updateMember(editingMember.id, memberData);
      showToast(`Member profile '${memberData.name}' updated!`);
    } else {
      await api.registerMember(memberData);
      showToast(`Member '${memberData.name}' registered successfully!`);
    }
    refreshData();
  };

  const handleDeleteMember = async (memberId) => {
    try {
      await api.deleteMember(memberId);
      showToast('Member removed successfully.', 'success');
      refreshData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Issue & Return Actions
  const handleIssueBook = async (issueData) => {
    try {
      await api.issueBook(issueData);
      showToast('Book issued successfully with 14-day borrowing duration!');
      refreshData();
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const handleReturnBook = async (recordId, notes) => {
    try {
      await api.returnBook(recordId, notes);
      showToast('Book return processed and available stock restored!');
      refreshData();
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const handleQuickIssue = (book) => {
    setPreselectedBook(book);
    setActiveTab('issues');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-500">Connecting to Library Backend...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                stats={stats}
                books={books}
                recentLoans={borrowRecords}
                onNavigate={setActiveTab}
                onQuickIssue={handleQuickIssue}
                onAdjustStock={(book) => {
                  setStockBook(book);
                  setStockModalOpen(true);
                }}
              />
            )}

            {activeTab === 'books' && (
              <BooksView
                books={books}
                genres={genres}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedGenre={selectedGenre}
                setSelectedGenre={setSelectedGenre}
                availableOnly={availableOnly}
                setAvailableOnly={setAvailableOnly}
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                onAddBook={() => {
                  setEditingBook(null);
                  setBookModalOpen(true);
                }}
                onEditBook={(book) => {
                  setEditingBook(book);
                  setBookModalOpen(true);
                }}
                onDeleteBook={handleDeleteBook}
                onAdjustStock={(book) => {
                  setStockBook(book);
                  setStockModalOpen(true);
                }}
                onQuickIssue={handleQuickIssue}
              />
            )}

            {activeTab === 'issues' && (
              <IssuesView
                borrowRecords={borrowRecords}
                books={books}
                members={members}
                preselectedBook={preselectedBook}
                onClearPreselectedBook={() => setPreselectedBook(null)}
                onIssueBook={handleIssueBook}
                onInitiateReturn={(record) => {
                  setReturningRecord(record);
                  setReturnModalOpen(true);
                }}
              />
            )}

            {activeTab === 'members' && (
              <MembersView
                members={members}
                onRegisterMember={() => {
                  setEditingMember(null);
                  setMemberModalOpen(true);
                }}
                onEditMember={(member) => {
                  setEditingMember(member);
                  setMemberModalOpen(true);
                }}
                onDeleteMember={handleDeleteMember}
                onViewHistory={(member) => {
                  setHistoryMember(member);
                  setHistoryModalOpen(true);
                }}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryView
                transactions={transactions}
                books={books}
                onAdjustStockClick={() => {
                  if (books.length > 0) {
                    setStockBook(books[0]);
                    setStockModalOpen(true);
                  } else {
                    showToast('Please add at least one book first.', 'error');
                  }
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <BookModal
        isOpen={bookModalOpen}
        onClose={() => setBookModalOpen(false)}
        onSubmit={handleSaveBook}
        book={editingBook}
        genres={genres}
        existingBooks={books}
      />

      <StockModal
        isOpen={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        onSubmit={handleStockAdjustment}
        book={stockBook}
      />

      <MemberModal
        isOpen={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        onSubmit={handleSaveMember}
        member={editingMember}
      />

      <MemberHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        member={historyMember}
      />

      <ReturnModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        onConfirm={handleReturnBook}
        record={returningRecord}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
export default App;
