# Finora — Design System v2 (Wallet, Transfer & Analytics-Focused)

**Version:** 2.0 — MVP
**Companion to:** `PRD.md`
**Relasi ke dokumen sebelumnya:** melengkapi `DESIGN.md` (v1) — tipografi dipertahankan sama, palet warna & beberapa layout komponen dieksplorasi ulang berdasarkan referensi baru ini.
**Sumber referensi visual:** mockup 3-layar iPhone (Home/Overview, Analytic, Send Money bottom-sheet)

> Catatan penting: semua **angka contoh** pada dokumen ini diambil langsung dari data yang sudah didefinisikan di `PRD.md` (§10, §15, §16), **bukan** angka dari mockup referensi (yang memakai USD & data fiktif). Ini agar dokumen desain benar-benar merepresentasikan apa yang akan dilihat pengguna Finora.

---

## 1. Adaptasi dari Referensi ke PRD

| Di Referensi | Di Finora | Alasan |
|---|---|---|
| `$14,242,549`, `$332,349`, `$1.000` (USD) | `Rp7.250.000`, `Rp1.000.000`, dst. (IDR, titik ribuan) | PRD §12 — currency MVP hanya IDR |
| Tombol **Transfer** + **Receive** di Balance Card | Tombol **Transfer** + **+ Tambah Transaksi** | PRD tidak punya konsep "Receive" (tidak ada integrasi bank/pihak luar — §4 non-goal). Dua aksi inti PRD adalah Transfer dan Create Transaction |
| Dropdown "Monthly" menempel di **Total Balance** | Dropdown "Monthly" **dihapus** dari Total Balance, hanya dipakai di Income Analysis & Recent Activity | Total Balance = akumulasi saldo semua wallet real-time (§10), bukan angka yang difilter per bulan. Yang berbasis bulan hanya Monthly Income, Monthly Expense, dan Reports |
| "Limited Balance" card + badge "+10%" | **Budget Overview** mini-card, memakai kategori nyata (contoh: *Food*, Budget Rp1.000.000, Spent Rp750.000 → 75%) | PRD §10 & §15 mendefinisikan Budget Overview + status Normal/Warning/Exceeded, bukan badge "+10%" bergaya saham |
| Avatar foto orang di "Recent Activity" | **Ikon kategori** dalam lingkaran warna | Transaction entity (PRD §18) tidak punya field "person" — hanya category & wallet |
| Gauge donut "Income / Outcome / Free Budget" | **Expense by Category** donut, legend = kategori nyata (Food, Transport, Shopping, dst.) | PRD §10 secara eksplisit meminta "Expense by Category", bukan rasio income/outcome |
| Bar chart bulan Mar–Jul dengan tooltip "Total Balance" | Bar chart **Income vs Expense per bulan**, tooltip menampilkan angka bulan yang dipilih (contoh: *August 2026 → Income Rp6.000.000*) | Selaras dengan Reports §16 & Dashboard §10 |
| Modal **"Send Money"** ke kontak orang (foto, nomor rekening, tombol Edit) | Modal **"Transfer Antar Wallet"** — memilih wallet tujuan milik sendiri (contoh: *BCA → Cash*), tanpa kontak/nomor rekening | PRD Transfer (§7, §14) hanya antar wallet milik user sendiri, bukan kirim ke orang lain (P2P bukan bagian MVP) |
| Selector bendera negara + mata uang (USD) di form amount | **Dihapus** — input amount langsung dalam Rupiah | Currency IDR bersifat fixed di MVP (§12) |
| Emoji 🔥 streak di headline "Welcome Adit" | Dihilangkan (dekoratif, tidak ada konsep streak di PRD) | Bukan bagian dari MVP scope |
| Bottom nav 4 ikon (Overview, Wallet, Analytic, Profile) | Bottom nav **5 slot** sesuai wireframe PRD §29: Home, Reports, **+ Add Transaction** (tombol tengah menonjol), Wallets, Settings — gaya visual "pill aktif berlabel" dari referensi dipertahankan | PRD sudah mendefinisikan struktur nav mobile secara eksplisit |

---

## 2. Elemen Signature: Hatch Texture untuk "Bagian Tidak Aktif"

Ini adalah temuan yang menyatukan referensi v1 dan v2: pada referensi kedua, **progress bar track** dan **bar chart bulan yang tidak dipilih** sama-sama memakai pola garis diagonal tipis (hatch), sementara bagian aktif/terisi memakai warna solid. Pola ini konsisten dengan garis diagonal dekoratif pada referensi v1.

Ditetapkan sebagai **signature element resmi Finora**:

> **Solid color = data aktif/terpakai. Hatch diagonal abu-abu = data potensial/belum terpakai/tidak dipilih.**

Penerapan konsisten di seluruh app:

| Komponen | Solid | Hatch |
|---|---|---|
| Budget progress bar | Bagian terpakai (mis. 75%) | Sisa kapasitas budget (25%) |
| Income vs Expense bar chart | Bulan yang sedang dipilih/aktif (mis. Agustus 2026) | Bulan-bulan lain sebagai pembanding |
| Wallet balance ring (opsional) | Saldo tersedia | — |

Pola ini bukan sekadar dekorasi — ia secara visual menjawab pertanyaan inti PRD: *"ke mana uang saya pergi, dan berapa yang masih tersisa."*

---

## 3. Design Tokens — Warna (v2)

### 3.1 Brand / Accent

| Token | Hex | Penggunaan |
|---|---|---|
| `violet-600` (primary baru) | `#6C4EF5` | Tombol Transfer, chart bar aktif, ikon wallet, tombol Send/Kirim |
| `violet-700` | `#5638D6` | Hover/active state |
| `violet-100` | `#EFEAFE` | Background tint avatar/ikon kategori |
| `lime-400` (accent sekunder) | `#B6F23D` | Segmen "Outcome"/kategori pada donut chart, aksen data sekunder |

### 3.2 Neutral & Surface

| Token | Hex | Penggunaan |
|---|---|---|
| `ink-950` | `#17171B` | Total Balance Card (dark) |
| `surface` | `#F4F4F6` | Background halaman |
| `card` | `#FFFFFF` | Card putih (Income Analysis, Expense Category, Recent Activity) |
| `hatch-track` | `#E7E7EA` (garis diagonal `#D8D8DC`) | Track progress bar & bar chart tidak aktif |

### 3.3 Semantik Keuangan (tetap konsisten dengan v1 — lihat §6 & §21 PRD)

| Token | Hex | Penggunaan |
|---|---|---|
| `income-500` | `#22C55E` (badge mint: bg `#DCFCE7`) | Income (+), status budget Normal (0–79%) |
| `expense-500` | `#EF4444` | Expense (−), status budget Exceeded (≥100%) |
| `warning-500` | `#F59E0B` | Status budget Warning (80–99%) |

> Perhatikan: badge hijau "+10%" pada referensi dipakai ulang sebagai badge **income-500**, bukan indikator pertumbuhan investasi (non-goal PRD §4).

---

## 4. Tipografi

**Tidak berubah dari v1** — konsistensi identitas font antar eksplorasi visual:

- Display/angka besar: **General Sans**, 600–700, tabular-nums.
- UI/body: **Inter**, 400–500.

(Lihat `DESIGN.md` v1 §4 untuk type scale lengkap.)

---

## 5. Komponen Inti (data = PRD, layout = referensi v2)

### 5.1 Total Balance Card

```text
┌───────────────────────────────────┐
│ Total Balance                     │  ← ink-950, tanpa dropdown Monthly
│ Rp7.250.000                       │  ← display-xl, putih
│                                    │
│  [↗ Transfer]   [+ Tambah Transaksi]│  ← violet-600 pill + secondary pill
└───────────────────────────────────┘
```

### 5.2 Budget Overview (pengganti "Limited Balance")

Menampilkan budget kategori yang paling mendekati limit bulan berjalan (bukan selalu "+10%"):

```text
Food                              75%
Rp750.000 / Rp1.000.000
[███████████████░░░░░]  ← solid income-500 (Normal), sisanya hatch
```

Jika status Warning/Exceeded, warna solid berubah ke `warning-500`/`expense-500` sesuai threshold PRD §15 — badge di kanan atas juga berubah ("75% · Normal", "85% · Warning", "110% · Exceeded").

### 5.3 Recent Activity → Recent Transactions

```text
[🍔] Food                          − Rp35.000
     Cash · Hari ini

[🚗] Transport                     − Rp25.000
     Cash · Hari ini

[💼] Salary                        + Rp6.000.000
     BCA · 1 Agustus
```

Ikon dalam lingkaran `violet-100`, warna angka mengikuti `income-500`/`expense-500`. Transfer ditampilkan terpisah dengan ikon panah dua arah, tanpa tanda +/−:

```text
[⇄] BCA → Cash                     Rp500.000
     Transfer · 1 Agustus
```

### 5.4 Income Analysis (Analytic screen)

```text
Income Analysis                         [Monthly ▾]
Rp6.000.000                              [+income badge]

   ┌ Rp6.000.000 ┐
   │             │
▓▓▓│    ▓▓▓      │▓▓▓
Apr May  Aug     Jun Jul
(hatch)  (solid, violet-600)  (hatch)
```

Bulan aktif (default: bulan berjalan sesuai konteks Reports §16, contoh *Agustus 2026*) ditampilkan solid `violet-600`; bulan lain hatch abu-abu sebagai pembanding.

### 5.5 Expense by Category (pengganti gauge Income/Outcome/Free Budget)

Donut chart dengan data nyata dari contoh Top Expenses PRD §16 (total = monthly expense Rp1.750.000):

```text
        Expense by Category
        ┌──────────────┐
        │   Rp1.750.000 │  ← total expense bulan berjalan, center label
        └──────────────┘

●Food Rp750.000   ●Transport Rp350.000
●Shopping Rp250.000  ●Entertainment Rp150.000
●Lainnya Rp250.000
```

Setiap kategori memakai warna dari palet kategori (`DESIGN.md` v1 §7), bukan hanya 2 warna violet/lime.

### 5.6 Transfer Antar Wallet (pengganti "Send Money")

```text
┌───────────────────────────────┐
│ Transfer Antar Wallet      ✕  │
│                                │
│ 🟣 Dari Wallet                 │
│    BCA · Rp4.500.000      ⌄   │
│ ──────────────────────────    │
│ 🟢 Ke Wallet                   │
│    Cash · Rp500.000       ⌄   │
│                                │
│ Jumlah                        │
│ [ Rp500.000              ]    │
│                                │
│ Catatan (Opsional)             │
│ [ Tulis sesuatu...        ]   │
│                                │
│ [        Transfer          ]  │  ← violet-600, full width
└───────────────────────────────┘
```

Validasi mengikuti PRD §14 & §30: wallet sumber ≠ wallet tujuan, amount > 0, saldo sumber mencukupi (pesan error §32 "You don't have enough balance in this wallet" jika gagal).

### 5.7 Bottom Navigation

Menggabungkan struktur 5-slot PRD §29 dengan gaya "pill aktif berlabel" dari referensi:

```text
┌──────────────────────────────────────┐
│  [🏠 Home]   📊    ➕    💳    👤     │
│  (pill aktif, ink-950 bg, teks putih) │
└──────────────────────────────────────┘
```

Item aktif ditampilkan sebagai pill gelap berisi ikon + label (meniru pill "Overview" pada referensi); item lain hanya ikon abu-abu. Tombol `➕` (Add Transaction) selalu menonjol dengan warna `violet-600`, terlepas dari tab mana yang aktif.

---

## 6. Pemetaan Halaman

| Route | Komponen dari dokumen ini |
|---|---|
| `/dashboard` | Total Balance Card (§5.1), Budget Overview (§5.2), Recent Transactions (§5.3) |
| `/reports` | Income Analysis bar chart (§5.4), Expense by Category donut (§5.5) — dengan filter bulan/tahun sesuai PRD §16 |
| `/transactions/new` (aksi Transfer) | Modal Transfer Antar Wallet (§5.6) |
| Semua halaman utama (mobile) | Bottom Navigation (§5.7) |

---

## 7. Implementasi Teknis — Tambahan Token

Ditambahkan ke `tailwind.config.ts` dari v1 (§10 `DESIGN.md`):

```ts
colors: {
  violet: { 600: "#6C4EF5", 700: "#5638D6", 100: "#EFEAFE" },
  lime: { 400: "#B6F23D" },
  hatch: { track: "#E7E7EA", line: "#D8D8DC" },
}
```

Pola hatch untuk progress bar/bar chart direkomendasikan sebagai SVG `<pattern>` diagonal 45°, stroke `hatch.line`, diulang di seluruh komponen "kapasitas belum terpakai" (§2).

---

**End of DESIGN-v2.md**
