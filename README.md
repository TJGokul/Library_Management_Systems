# Library Management System

> **Full-Stack Developer Machine Coding Assessment Submission**  
> Built with **Spring Boot 3.3.5 (Java 21/25)**, **PostgreSQL / H2**, and **React 19 (Vite + Tailwind CSS)**.

---

## 1. Project Overview

A robust, enterprise-grade Library Management System designed for library administration and circulation desks. The system enforces strict domain invariants and business rules on the backend, ensuring full data consistency, auditability, and atomic transactions.

---

## 2. Key Modules & Business Rules Handled

| Module | Implemented Capabilities | Business Rules Enforced |
| :--- | :--- | :--- |
| **Book Management** | Add, View, Edit, Delete, Live Search, Genre Filter, Multi-Attribute Sort. | • Every book must have a **unique ISBN**.<br>• Cannot delete books that currently have active borrowed copies.<br>• Search across Title, Author, ISBN, and Genre simultaneously. |
| **Inventory Management** | Stock additions, stock reductions, and full audit ledger. | • **Available stock cannot exceed total stock**.<br>• **Stock cannot become negative**.<br>• Cannot reduce total stock below the count of currently borrowed copies.<br>• Every stock modification logs an audited transaction with quantity deltas and timestamps. |
| **Member Management** | Register patrons, update profile/status, search, view borrowing history. | • Unique membership numbers and email addresses.<br>• Track active loan counters in real time.<br>• Block suspended members from borrowing. |
| **Book Issue Management** | Checkout books to registered members. | • **Maximum 3 books borrowed simultaneously** per member.<br>• Cannot issue when available copies is `0`.<br>• **Default borrowing duration is strictly 14 days** (`dueDate = issueDate + 14`).<br>• Atomically decrements available copies and writes an inventory `ISSUE` audit log. |
| **Book Return Management** | Process returns and check in copies. | • Restores book stock count (`availableCopies + 1`).<br>• Validates `availableCopies <= totalCopies`.<br>• Marks record as `RETURNED`, sets `returnDate`, and writes an inventory `RETURN` audit log. |

---

## 3. Technology Stack

- **Backend:** Java 21 / 25, Spring Boot 3.3.5, Spring Data JPA, Hibernate, Bean Validation (`@Valid`), HikariCP.
- **Database:** PostgreSQL (with embedded H2 fallback profile for zero-friction evaluation).
- **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide React icons.
- **Build Tools:** Maven Wrapper (`mvnw`), npm.

---

## 4. Prerequisites

1. **Java Development Kit (JDK 21 or 25)** installed (`java -version`).
2. **Node.js (v18+) & npm** installed (`node -v`).
3. *(Optional)* **Docker** or a local **PostgreSQL** instance on port `5432`.

---

## 5. Quick Start Execution Guide

### Option A: Standard Startup with Zero Setup (Uses Embedded H2 Database)

The backend includes a pre-configured `h2` profile that requires **no external database installation**!

#### 1. Start the Spring Boot Backend
Open a terminal in the project root:
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
*(On Linux/macOS, run `./mvnw spring-boot:run`)*

*The backend starts at `http://localhost:8080`. Sample books, members, active loans, and audit logs are automatically seeded on first launch!*

#### 2. Start the React Frontend
Open a second terminal in the project root:
```bash
cd frontend
npm install
npm run dev
```

*The frontend starts at `http://localhost:5173`. Open it in any browser!*

---

### Option B: Running with PostgreSQL

If you prefer to run against PostgreSQL:

1. **Start PostgreSQL via Docker Compose:**
   ```bash
   docker compose up -d
   ```
   *(Or ensure your local PostgreSQL is running on port `5432` with database `library_db` and user `postgres`).*

2. **Start the Backend:**
   ```bash
   cd backend
   .\mvnw.cmd spring-boot:run
   ```
   *(Optionally pass credentials via environment variables: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`).*

3. **Start the Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

---

## 6. Seed Data Included Out-of-the-Box

On startup, `DataSeeder` automatically initializes:
- **8 Realistic Book Titles** across Computer Science, Classic Fiction, Thriller, Science, and History.
- **5 Registered Members** (e.g. `MEM-1001: Gokulraj T`, `MEM-1002: Sarah Jenkins`).
- **Initial Inventory Ledger** recording catalog addition of each title.
- **Active & Overdue Loan Scenarios** (including an overdue book to test the 14-day duration alert and a member with 2 active loans to test the 3-book limit).

---

## 7. Running Backend Business Rule Tests

An automated test suite verifies all mandatory business rules:

```bash
cd backend
.\mvnw.cmd test
```

### Verified Test Cases:
1. `testUniqueIsbnEnforcement()`: Confirms duplicate ISBNs are rejected with HTTP 409 Conflict.
2. `testNegativeStockRejection()`: Confirms reducing stock below zero or below currently borrowed copies is rejected.
3. `testMaxThreeBooksLimit()`: Confirms a member cannot borrow a 4th book simultaneously.
4. `testDefaultFourteenDaysLoanDuration()`: Confirms due date is calculated as `issueDate + 14 days`.
5. `testIssueAndReturnInventoryUpdates()`: Confirms available copies decrement on issue and restore on return.
6. `testInventoryTransactionAuditHistory()`: Confirms full transaction history is maintained.

---

## 8. REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | At-a-glance metrics (titles, total copies, available copies, active loans, overdue). |
| `GET` | `/api/books` | List books with search, genre, availableOnly, and sorting. |
| `POST` | `/api/books` | Create new book title with initial stock and inventory audit record. |
| `PUT` | `/api/books/{id}` | Update book details (title, author, genre, published year). |
| `DELETE` | `/api/books/{id}` | Delete book (blocked if copies are currently borrowed). |
| `GET` | `/api/books/genres` | Distinct list of book genres. |
| `POST` | `/api/inventory/adjust` | Add or reduce stock with reason and transaction audit logging. |
| `GET` | `/api/inventory/transactions` | Chronological audit ledger (filter by `bookId`). |
| `GET` | `/api/members` | List members with dynamic `activeLoansCount`. |
| `POST` | `/api/members` | Register new member. |
| `GET` | `/api/members/{id}/history` | Member loan history and active borrowings. |
| `POST` | `/api/issues` | Issue book (validates 3-book limit, stock > 0, 14-day duration). |
| `POST` | `/api/returns/{id}` | Process return and restore available stock. |
| `GET` | `/api/issues` | Filter loan records by `status` (ISSUED, OVERDUE, RETURNED). |

---

## 9. Codebase Structure

```
Library_Management_System/
├── docker-compose.yml             # Docker PostgreSQL configuration
├── README.md                      # Complete execution documentation
├── backend/                       # Spring Boot Application
│   ├── pom.xml
│   ├── mvnw.cmd / mvnw
│   └── src/
│       ├── main/java/com/library/
│       │   ├── config/            # DataSeeder
│       │   ├── controller/        # REST Controllers
│       │   ├── dto/               # Request/Response payloads with validation
│       │   ├── entity/            # JPA entities (Book, Member, BorrowRecord, InventoryTransaction)
│       │   ├── exception/         # GlobalExceptionHandler (@RestControllerAdvice)
│       │   ├── repository/        # Spring Data JPA Repositories
│       │   └── service/           # @Transactional business logic
│       └── test/java/com/library/ # Automated Business Rule Test Suite
└── frontend/                      # React 19 + Vite + Tailwind CSS Application
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── components/            # Navbar, Toast, StatCards, Modals
        ├── pages/                 # Dashboard, Books, Issues, Members, Inventory
        ├── services/api.js        # API Client
        └── App.jsx
```
