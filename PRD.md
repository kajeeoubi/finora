# Finora — Product Requirements Document (PRD)

**Version:** 1.0 — MVP  
**Product:** Finora  
**Platform:** Responsive Web Application  
**Architecture:** Fullstack Next.js  
**Status:** Product Blueprint

---

## 1. Product Overview

Finora adalah aplikasi personal finance yang membantu pengguna mencatat, memantau, dan memahami kondisi keuangan pribadi melalui pencatatan pemasukan, pengeluaran, saldo per wallet, transfer antar-wallet, budget, dan laporan keuangan.

### Product Principle

> Pengguna tidak hanya mengetahui berapa uang yang dimiliki, tetapi juga memahami ke mana uang tersebut pergi.

---

## 2. Problem Statement

Pengguna sering mengalami beberapa masalah:

- Tidak mengetahui total pengeluaran dalam satu bulan.
- Uang tersebar di cash, rekening bank, dan e-wallet.
- Sulit mengetahui kategori pengeluaran terbesar.
- Budget bulanan dibuat secara informal tanpa monitoring.
- Pencatatan manual tidak konsisten dan sulit ditinjau kembali.

---

## 3. Product Goals

1. Membuat pencatatan pemasukan dan pengeluaran menjadi cepat dan sederhana.
2. Memberikan gambaran saldo total dan saldo setiap wallet.
3. Membantu pengguna memahami pola pengeluaran.
4. Memungkinkan pengguna membuat dan memantau budget bulanan.
5. Menyediakan fondasi yang mudah dikembangkan ke fitur financial insight, savings goal, recurring transactions, dan fitur lanjutan lainnya.

---

## 4. Non-Goals for MVP

Fitur berikut tidak termasuk MVP:

- Integrasi langsung dengan rekening bank/open banking.
- Investment portfolio tracking.
- Debt/loan management.
- AI financial advisor.
- Shared/family finance.
- Automatic receipt/OCR processing.
- Native mobile application.

---

## 5. Target User

Target utama:

- Mahasiswa.
- Pekerja awal karier.
- Freelancer.
- Individu yang ingin mulai mengatur keuangan.
- Pengguna yang memiliki beberapa tempat penyimpanan uang seperti cash, bank account, dan e-wallet.

---

# 6. MVP Feature Scope

| Module | Feature | Priority | Description |
|---|---|---|---|
| Authentication | Register/Login/Logout | P0 | User dapat membuat akun dan mengakses data pribadi. |
| Dashboard | Balance Summary | P0 | Menampilkan total saldo, pemasukan, pengeluaran, dan sisa. |
| Dashboard | Charts | P0 | Grafik income vs expense dan expense berdasarkan kategori. |
| Transactions | Create Transaction | P0 | Mencatat income atau expense. |
| Transactions | Edit/Delete | P0 | Mengubah atau menghapus transaksi. |
| Transactions | History & Filter | P0 | Melihat dan memfilter riwayat transaksi. |
| Categories | Category Management | P0 | Kategori income/expense bawaan dan custom. |
| Wallets | Wallet CRUD | P0 | Cash, bank, e-wallet, dan wallet lainnya. |
| Transfers | Wallet Transfer | P0 | Memindahkan uang antar-wallet tanpa dianggap sebagai expense. |
| Budgets | Monthly Budget | P0 | Menentukan batas pengeluaran per kategori. |
| Reports | Monthly Report | P1 | Ringkasan pengeluaran dan income berdasarkan periode. |
| Settings | Profile/Settings | P1 | Pengaturan profil dasar dan preferensi. |

---

# 7. Core Financial Concept

Finora membedakan tiga konsep utama:

```text
INCOME
EXPENSE
TRANSFER
```

### Income

Menambah saldo wallet.

```text
BCA
Rp5.000.000
       +
Rp500.000 Income
       ↓
Rp5.500.000
```

### Expense

Mengurangi saldo wallet.

```text
BCA
Rp5.000.000
       -
Rp50.000 Expense
       ↓
Rp4.950.000
```

### Transfer

Memindahkan uang antar-wallet dan tidak dihitung sebagai income maupun expense.

```text
BCA                         Cash
Rp5.000.000                 Rp500.000
     │
     │ Rp500.000
     └──────────────────────>
                             Rp1.000.000

BCA = Rp4.500.000
Cash = Rp1.000.000
Total tetap = Rp5.500.000
```

---

# 8. User Flow

## 8.1 Registration

```text
Landing
   ↓
Register
   ↓
Validate Form
   ↓
Create Account
   ↓
Create Default Categories
   ↓
Create First Wallet
   ↓
Dashboard
```

## 8.2 Login

```text
Login
   ↓
Validate Credentials
   ↓
Create Session
   ↓
Dashboard
```

## 8.3 Add Expense

```text
Dashboard
   ↓
Add Transaction
   ↓
Select Expense
   ↓
Enter Amount
   ↓
Select Category
   ↓
Select Wallet
   ↓
Select Date
   ↓
Optional Note
   ↓
Submit
   ↓
Validate
   ↓
Update Wallet Balance
   ↓
Create Transaction
   ↓
Dashboard
```

## 8.4 Add Income

```text
Dashboard
   ↓
Add Transaction
   ↓
Select Income
   ↓
Enter Amount
   ↓
Select Category
   ↓
Select Wallet
   ↓
Select Date
   ↓
Optional Note
   ↓
Submit
   ↓
Update Wallet Balance
   ↓
Create Transaction
   ↓
Dashboard
```

## 8.5 Transfer

```text
Dashboard
   ↓
Transfer
   ↓
Select Source Wallet
   ↓
Select Destination Wallet
   ↓
Enter Amount
   ↓
Submit
   ↓
Validate
   ↓
Decrease Source Wallet
   ↓
Increase Destination Wallet
   ↓
Create Transfer
   ↓
Dashboard
```

## 8.6 Budget

```text
Budgets
   ↓
Create Budget
   ↓
Select Category
   ↓
Set Monthly Amount
   ↓
Save
   ↓
Calculate Spent
   ↓
Calculate Remaining
   ↓
Display Progress
```

---

# 9. Application Pages

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/login` | Login |
| `/register` | Registration |
| `/dashboard` | Financial dashboard |
| `/transactions` | Transaction history |
| `/transactions/new` | Create transaction |
| `/wallets` | Wallet management |
| `/categories` | Category management |
| `/budgets` | Budget management |
| `/reports` | Financial reports |
| `/settings` | Profile/settings |

---

# 10. Dashboard Requirements

Dashboard harus menampilkan:

### Total Balance

Jumlah seluruh saldo wallet milik user.

### Monthly Income

Total income pada bulan aktif.

### Monthly Expense

Total expense pada bulan aktif.

### Income vs Expense Chart

Grafik pemasukan dan pengeluaran berdasarkan waktu.

### Expense by Category

Distribusi pengeluaran berdasarkan kategori.

### Recent Transactions

Daftar transaksi terbaru.

### Budget Overview

Progress budget kategori pada bulan aktif.

### Example

```text
Good morning, Ar

Total Balance
Rp7.250.000

Income
+ Rp6.000.000

Expense
- Rp1.750.000

Income vs Expense
[Chart]

Expense by Category
[Chart]

Recent Transactions
- Food          Rp35.000
- Transport     Rp25.000
+ Salary        Rp6.000.000
```

---

# 11. Transaction Requirements

Setiap transaction minimal memiliki:

- Amount.
- Type.
- Category.
- Wallet.
- Transaction date.
- Optional note.

### Expense

Rules:

```text
wallet.balance -= amount
```

### Income

Rules:

```text
wallet.balance += amount
```

### Edit Transaction

Ketika transaksi diubah, sistem harus mengembalikan efek transaksi lama terlebih dahulu lalu menerapkan efek transaksi baru.

Contoh:

```text
Old Expense = Rp50.000
New Expense = Rp75.000

Rollback old:
wallet += Rp50.000

Apply new:
wallet -= Rp75.000

Net effect:
wallet -= Rp25.000
```

### Delete Transaction

Sistem harus melakukan reversal terhadap efek transaksi sebelum menghapus transaksi.

---

# 12. Wallet Requirements

User dapat membuat wallet seperti:

```text
Cash
BCA
Mandiri
Jago
GoPay
OVO
DANA
Other
```

### Wallet Type

```text
CASH
BANK
EWALLET
OTHER
```

### Wallet Fields

- Name.
- Type.
- Balance.
- Currency.

Default currency MVP:

```text
IDR
```

---

# 13. Category Requirements

Default categories dapat mencakup:

### Expense

```text
Food
Transport
Shopping
Bills
Entertainment
Health
Education
Other
```

### Income

```text
Salary
Freelance
Bonus
Investment
Other
```

User dapat membuat kategori custom.

Category memiliki:

- Name.
- Type.
- Icon.
- Optional color.
- Owner/user ID.

---

# 14. Transfer Requirements

Transfer digunakan untuk perpindahan uang antar-wallet.

Contoh:

```text
BCA → Cash
Rp500.000
```

Rules:

1. Source wallet wajib dimiliki user.
2. Destination wallet wajib dimiliki user.
3. Source dan destination tidak boleh sama.
4. Amount harus lebih besar dari 0.
5. Source wallet harus memiliki saldo yang cukup jika overdraft belum didukung.
6. Transfer tidak dihitung sebagai income.
7. Transfer tidak dihitung sebagai expense.
8. Perubahan saldo harus atomic.

---

# 15. Budget Requirements

User dapat membuat budget berdasarkan kategori dan bulan.

Contoh:

```text
Food
Budget: Rp1.000.000
Spent: Rp750.000
Remaining: Rp250.000
```

### Budget Progress

```text
750.000 / 1.000.000 = 75%
```

Status:

```text
0–79%   → Normal
80–99%  → Warning
>=100%  → Exceeded
```

> Status dan threshold dapat diubah pada tahap UI/product refinement.

### Important Rule

`spent` tidak disimpan sebagai field statis.

Nilai tersebut dihitung dari transaksi expense:

```text
SUM(transaction.amount)
WHERE
type = EXPENSE
AND category_id = budget.category_id
AND month = budget.month
AND year = budget.year
```

---

# 16. Reports

MVP menyediakan laporan berdasarkan:

- Bulan.
- Tahun.
- Category.
- Wallet.
- Income/Expense.

Contoh:

```text
August 2026

Income
Rp6.000.000

Expense
Rp1.750.000

Top Expenses

Food          Rp750.000
Transport     Rp350.000
Shopping      Rp250.000
Entertainment Rp150.000
```

---

# 17. ERD / Database

## Relationship

```text
User
 │
 ├── 1:N Wallet
 │
 ├── 1:N Category
 │
 ├── 1:N Transaction
 │
 ├── 1:N Transfer
 │
 └── 1:N Budget

Wallet
 │
 ├── 1:N Transaction
 │
 ├── 1:N Transfer (source)
 └── 1:N Transfer (destination)

Category
 │
 ├── 1:N Transaction
 └── 1:N Budget
```

---

# 18. Database Entities

## User

```text
id
name
email
passwordHash
image
createdAt
updatedAt
```

## Wallet

```text
id
userId
name
type
balance
currency
createdAt
updatedAt
```

## Category

```text
id
userId
name
type
icon
createdAt
updatedAt
```

`userId` dapat nullable untuk global/default category.

## Transaction

```text
id
userId
walletId
categoryId
type
amount
note
transactionAt
createdAt
updatedAt
```

## Transfer

```text
id
userId
fromWalletId
toWalletId
amount
note
transferAt
createdAt
```

## Budget

```text
id
userId
categoryId
amount
month
year
createdAt
updatedAt
```

---

# 19. Enums

## WalletType

```text
CASH
BANK
EWALLET
OTHER
```

## TransactionType

```text
INCOME
EXPENSE
```

## CategoryType

```text
INCOME
EXPENSE
```

Transfer menggunakan entity terpisah sehingga tidak masuk ke `TransactionType`.

---

# 20. Database Constraints & Indexes

Recommended constraints:

```text
User.email → UNIQUE

Wallet.userId → INDEX
Transaction.userId → INDEX
Transaction.walletId → INDEX
Transaction.categoryId → INDEX
Transaction.transactionAt → INDEX

Transfer.userId → INDEX
Transfer.fromWalletId → INDEX
Transfer.toWalletId → INDEX

Budget.userId → INDEX
Budget.categoryId → INDEX
```

Recommended unique constraint:

```text
Budget(
  userId,
  categoryId,
  month,
  year
)
```

Tujuannya agar user tidak memiliki dua budget untuk kategori dan periode yang sama.

---

# 21. Business Rules

1. Amount harus lebih besar dari 0.
2. Income menambah saldo wallet.
3. Expense mengurangi saldo wallet.
4. Transfer hanya memindahkan saldo.
5. Transfer tidak memengaruhi total balance.
6. Source wallet dan destination wallet harus berbeda.
7. User hanya dapat mengakses resource miliknya sendiri.
8. Default category dapat digunakan oleh semua user.
9. Budget spent dihitung dari transaction.
10. Wallet balance harus tetap konsisten dengan transaksi.
11. Semua perubahan saldo harus dilakukan menggunakan database transaction.
12. Delete/update transaction harus melakukan balance adjustment dengan benar.
13. Expense tidak boleh melebihi saldo jika overdraft belum didukung.

---

# 22. Atomic Financial Operations

Operasi keuangan wajib menggunakan database transaction.

Contoh transfer:

```text
BEGIN

Decrease source wallet
        ↓
Increase destination wallet
        ↓
Create transfer

COMMIT
```

Jika salah satu operasi gagal:

```text
ROLLBACK
```

Tidak boleh terjadi kondisi:

```text
BCA - Rp500.000
Cash tidak + Rp500.000
```

---

# 23. API / Route Handlers

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

## Wallets

```http
GET    /api/wallets
POST   /api/wallets
GET    /api/wallets/:id
PATCH  /api/wallets/:id
DELETE /api/wallets/:id
```

## Categories

```http
GET    /api/categories
POST   /api/categories
PATCH  /api/categories/:id
DELETE /api/categories/:id
```

## Transactions

```http
GET    /api/transactions
POST   /api/transactions
GET    /api/transactions/:id
PATCH  /api/transactions/:id
DELETE /api/transactions/:id
```

### Transaction Filters

```http
GET /api/transactions?type=EXPENSE
GET /api/transactions?categoryId=123
GET /api/transactions?walletId=456
GET /api/transactions?month=8&year=2026
```

Filters dapat dikombinasikan.

## Transfers

```http
GET  /api/transfers
POST /api/transfers
GET  /api/transfers/:id
```

## Budgets

```http
GET    /api/budgets
POST   /api/budgets
PATCH  /api/budgets/:id
DELETE /api/budgets/:id
```

## Dashboard

```http
GET /api/dashboard
```

Contoh response:

```json
{
  "balance": 7250000,
  "income": 6000000,
  "expense": 1750000,
  "recentTransactions": [],
  "expenseByCategory": [],
  "monthlySummary": [],
  "budgetOverview": []
}
```

## Reports

```http
GET /api/reports
```

---

# 24. Server Architecture

Finora menggunakan Next.js App Router sebagai fullstack framework.

## Internal Mutation

```text
Form
  ↓
Server Action
  ↓
Zod Validation
  ↓
Authorization
  ↓
Prisma
  ↓
PostgreSQL
  ↓
Revalidate
```

## HTTP API

```text
Client
  ↓
Route Handler
  ↓
Authentication
  ↓
Authorization
  ↓
Validation
  ↓
Prisma
  ↓
PostgreSQL
```

Server Actions digunakan untuk mutation internal aplikasi jika tidak membutuhkan public HTTP API.

Route Handlers digunakan untuk endpoint HTTP yang memang diperlukan.

---

# 25. Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI | shadcn/ui |
| ORM | Prisma |
| Database | PostgreSQL |
| Authentication | Auth.js |
| Validation | Zod |
| Forms | React Hook Form |
| Charts | Recharts |
| Deployment | Vercel |
| Version Control | Git + GitHub |

---

# 26. Project Structure

```text
finora/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── public/
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── transactions/
│   │   │   │   ├── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   ├── wallets/
│   │   │   │   └── page.tsx
│   │   │   ├── categories/
│   │   │   │   └── page.tsx
│   │   │   ├── budgets/
│   │   │   │   └── page.tsx
│   │   │   ├── reports/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   │
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── transactions/
│   │   │   ├── wallets/
│   │   │   ├── categories/
│   │   │   ├── transfers/
│   │   │   ├── budgets/
│   │   │   ├── dashboard/
│   │   │   └── reports/
│   │   │
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── actions/
│   │   ├── transaction.ts
│   │   ├── wallet.ts
│   │   ├── category.ts
│   │   ├── transfer.ts
│   │   └── budget.ts
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   ├── wallets/
│   │   ├── budgets/
│   │   └── charts/
│   │
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── validations.ts
│   │   └── utils.ts
│   │
│   └── types/
│       └── index.ts
│
├── .env
├── package.json
└── tsconfig.json
```

---

# 27. Authentication

Authentication menggunakan Auth.js.

Flow:

```text
Register
   ↓
Validate
   ↓
Hash Password
   ↓
Create User
   ↓
Login
   ↓
Session
```

Protected route:

```text
/dashboard
```

Jika tidak memiliki session:

```text
/dashboard
    ↓
Check Session
    ↓
No Session
    ↓
/login
```

---

# 28. Security Requirements

1. Password tidak boleh disimpan sebagai plaintext.
2. Password harus di-hash.
3. Session harus diverifikasi di server.
4. Authorization harus dilakukan berdasarkan `userId`.
5. Jangan mempercayai `userId` dari client untuk menentukan owner data.
6. Semua resource harus diverifikasi kepemilikannya.
7. Database URL dan secret disimpan dalam environment variables.
8. Secret tidak boleh masuk client bundle.
9. Input harus divalidasi menggunakan Zod.
10. Error response tidak boleh membocorkan informasi sensitif.

---

# 29. UI/UX Direction

## Desktop

```text
┌─────────────────────────────────────────────┐
│ Finora                         🔔  Profile  │
├────────────┬────────────────────────────────┤
│ Dashboard  │                                │
│            │ Dashboard                      │
│ Transactions│                              │
│            │ Total Balance                  │
│ Wallets    │ Rp7.250.000                    │
│            │                                │
│ Categories │ Income / Expense               │
│            │                                │
│ Budgets    │ Charts                         │
│            │                                │
│ Reports    │ Recent Transactions            │
│            │                                │
│ Settings   │                                │
└────────────┴────────────────────────────────┘
```

## Mobile

```text
┌─────────────────────┐
│ Finora          🔔  │
│                     │
│ Rp7.250.000         │
│                     │
│ Income   Expense    │
│ +6jt     -1.75jt    │
│                     │
│ [Chart]             │
│                     │
│ Recent              │
│ Food       -35k     │
│ Transport  -25k     │
│ Salary     +6jt     │
│                     │
├─────────────────────┤
│ 🏠  📊  ➕  💳  👤 │
└─────────────────────┘
```

---

# 30. Validation Requirements

### User

```text
email → valid + unique
password → minimum requirement
name → required
```

### Transaction

```text
amount > 0
type → valid enum
wallet → exists + belongs to user
category → exists + valid type
transactionAt → valid date
```

### Transfer

```text
amount > 0
fromWalletId != toWalletId
both wallets belong to current user
source balance >= amount
```

### Budget

```text
amount > 0
category belongs to user/global category
month = 1..12
year = valid year
unique(userId, categoryId, month, year)
```

---

# 31. Empty States

Setiap halaman harus memiliki empty state.

### Transactions

```text
No transactions yet.

Start tracking your money
by adding your first transaction.

[ + Add Transaction ]
```

### Wallets

```text
No wallets yet.

Add your first wallet
to start tracking your balance.

[ + Add Wallet ]
```

### Budgets

```text
No budgets yet.

Create a monthly budget
to control your spending.

[ + Create Budget ]
```

---

# 32. Error Handling

Contoh:

### Insufficient Balance

```text
You don't have enough balance
in this wallet.
```

### Invalid Wallet

```text
Wallet not found.
```

### Unauthorized Resource

```text
You don't have permission
to access this resource.
```

### Validation

```text
Amount must be greater than 0.
```

---

# 33. MVP Acceptance Criteria

MVP dianggap selesai apabila:

- [ ] User dapat register.
- [ ] User dapat login.
- [ ] User dapat logout.
- [ ] User dapat membuat wallet.
- [ ] User dapat mengubah wallet.
- [ ] User dapat menghapus wallet.
- [ ] User dapat membuat income.
- [ ] Income menambah saldo wallet.
- [ ] User dapat membuat expense.
- [ ] Expense mengurangi saldo wallet.
- [ ] User dapat mengedit transaction.
- [ ] User dapat menghapus transaction.
- [ ] Saldo tetap konsisten setelah edit/delete.
- [ ] User dapat membuat kategori custom.
- [ ] User dapat melakukan transfer antar-wallet.
- [ ] Transfer tidak memengaruhi total balance.
- [ ] User dapat membuat budget.
- [ ] Budget menampilkan spent dan remaining.
- [ ] Dashboard menampilkan total balance.
- [ ] Dashboard menampilkan income.
- [ ] Dashboard menampilkan expense.
- [ ] Dashboard menampilkan chart.
- [ ] Dashboard menampilkan recent transactions.
- [ ] User dapat melihat report.
- [ ] User tidak dapat mengakses data user lain.
- [ ] UI responsive.
- [ ] Application dapat di-deploy ke production.

---

# 34. Development Roadmap

## Phase 1 — Foundation

- Setup Next.js.
- Setup TypeScript.
- Setup Tailwind.
- Setup shadcn/ui.
- Setup PostgreSQL.
- Setup Prisma.
- Create schema.
- Migration.
- Seed data.

## Phase 2 — Authentication

- Register.
- Login.
- Logout.
- Session.
- Protected routes.
- Authorization.

## Phase 3 — Wallet

- Wallet list.
- Create wallet.
- Edit wallet.
- Delete wallet.
- Balance management.

## Phase 4 — Category

- Default categories.
- Custom categories.
- Category CRUD.

## Phase 5 — Transaction

- Income.
- Expense.
- Transaction history.
- Edit.
- Delete.
- Filtering.
- Pagination if needed.

## Phase 6 — Transfer

- Source wallet.
- Destination wallet.
- Balance validation.
- Atomic transaction.

## Phase 7 — Dashboard

- Total balance.
- Income.
- Expense.
- Monthly summary.
- Charts.
- Recent transactions.

## Phase 8 — Budget

- Create budget.
- Budget calculation.
- Progress.
- Warning/exceeded state.

## Phase 9 — Reports

- Monthly report.
- Category breakdown.
- Wallet breakdown.
- Date filtering.

## Phase 10 — Polish & Production

- Responsive UI.
- Loading states.
- Empty states.
- Error handling.
- Form validation.
- Testing.
- Production database.
- Deployment.

---

# 35. Future Features

Fitur setelah MVP:

1. Recurring transactions.
2. Payment reminders.
3. Savings goals.
4. Subscription tracker.
5. Debt tracking.
6. Investment tracking.
7. Export CSV/Excel/PDF.
8. Financial health score.
9. AI financial insights.
10. Shared/family finance.
11. Receipt upload.
12. OCR receipt processing.
13. Bank/open-banking integrations.
14. Multi-currency.
15. Advanced analytics.

---

# 36. Product Success Metrics

Metrik awal:

- Transaction creation success rate.
- Jumlah transaksi yang dicatat per active user.
- Retention 7 hari.
- Retention 30 hari.
- Persentase user yang membuat minimal satu budget.
- Persentase user yang memiliki lebih dari satu wallet.
- Error rate pada financial operations.
- Jumlah user aktif bulanan.

---

# 37. Final Product Direction

Finora MVP harus terasa:

- Cepat.
- Sederhana.
- Mudah dipahami.
- Responsive.
- Akurat.
- Dapat dipercaya.

Prioritas utama adalah **akurasi saldo dan kemudahan pencatatan**, bukan jumlah fitur.

Arsitektur fullstack Next.js dipilih agar pengembangan dan deployment tetap sederhana, sementara Prisma + PostgreSQL memberikan fondasi relational database yang kuat untuk pengembangan fitur finansial berikutnya.

---

## Final Architecture

```text
                    FINORA
                       │
                       ▼
                 Next.js App
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
       UI        Server Actions   Route Handlers
        │              │              │
        └──────────────┼──────────────┘
                       │
                       ▼
                    Prisma
                       │
                       ▼
                  PostgreSQL
```

### Core Domain

```text
                 USER
                  │
       ┌──────────┼───────────┐
       │          │           │
     WALLET    CATEGORY    BUDGET
       │          │           │
       └──────┬───┘           │
              │               │
         TRANSACTION           │
          /       \            │
       INCOME    EXPENSE       │
                              │
                         BUDGET TRACKING

              TRANSFER
            /           \
       WALLET A       WALLET B
```

**End of PRD**
