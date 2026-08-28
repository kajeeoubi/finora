# Finora — Design System & UI Guidelines

**Version:** 1.0 — MVP
**Companion to:** `PRD.md`
**Sumber referensi visual:** mockup 3-layar (Landing dark hero, Home/Balance, Wallet & Trend detail)
**Platform:** Responsive Web (Next.js App Router, Tailwind CSS, shadcn/ui)

---

## 1. Filosofi Desain

Mengacu pada Product Principle di PRD:

> Pengguna tidak hanya mengetahui berapa uang yang dimiliki, tetapi juga memahami ke mana uang tersebut pergi.

Prinsip desain Finora:

1. **Arah uang harus terbaca secara visual** — income (+) selalu hijau, expense (−) selalu merah, transfer selalu netral (indigo), tidak pernah dianggap +/-.
2. **Angka adalah hero** — saldo, income, expense, dan progress budget ditampilkan besar, tebal, dengan tabular numerals agar mudah dipindai.
3. **Cepat & sederhana** — satu aksi utama per layar (Add Transaction, Add Wallet, Create Budget), tidak ada langkah yang tidak perlu.
4. **Dapat dipercaya** — visual tenang, kontras cukup, tidak ada elemen dekoratif yang mengganggu keakuratan data.

Ini konsisten dengan bagian *37. Final Product Direction* di PRD: Cepat, Sederhana, Mudah dipahami, Responsive, Akurat, Dapat dipercaya.

---

## 2. Adaptasi dari Referensi ke Finora

Referensi visual yang diberikan adalah mockup fintech generik (mobile app, mata uang USD, ada elemen "earn interest" dan chart tren seperti investasi). Beberapa penyesuaian dilakukan agar sesuai PRD:

| Di Referensi | Di Finora | Alasan |
|---|---|---|
| Mata uang USD, format `5,820 USD` | Mata uang **IDR**, format `Rp7.250.000` (prefix, titik ribuan) | PRD §12 — default currency MVP adalah IDR |
| Label "Earn up to 0.42% more" pada Balance Card | Diganti insight kontekstual, mis. "Sisa budget bulan ini 62%" atau "Diperbarui hari ini" | Finora tidak punya fitur bunga/interest (non-goal) |
| Chart tren naik/turun bergaya harga saham (screen 3) | Dipakai ulang sebagai **grafik tren pengeluaran/pemasukan** di Dashboard & Reports, bukan investment tracking | PRD §4 — Investment portfolio tracking eksplisit **non-goal** |
| Kartu "My Wallet" bergaya kartu kredit dengan nomor kartu tersamar | Dipakai untuk wallet bertipe `BANK`/`EWALLET`, tanpa nomor kartu (field tidak ada di schema) — menampilkan Nama Wallet, Tipe, dan Saldo | Wallet entity (PRD §18) hanya punya `name, type, balance, currency` |
| Bottom nav 4 ikon (chat, shuffle, wallet, briefcase) | Bottom nav **5 ikon**: Home, Reports, **+ Add Transaction** (tombol menonjol), Wallets, Settings | Mengikuti wireframe mobile PRD §29 persis |
| Layar landing gelap sebagai onboarding app mobile | Dipakai sebagai **halaman `/` (Landing/marketing)** untuk web | PRD §9 — `/` = Landing page |
| Toggle dua-titik di pojok kiri atas tiap layar | Dipetakan sebagai **theme toggle (light/dark)**, ditaruh di header app dan `/settings` | Elemen konsisten di ketiga layar referensi → cocok jadi global control |

Semua elemen lain (palet warna, tipografi, radius besar, kartu gelap dengan aksen indigo/emas) dipertahankan sebagai identitas visual Finora.

---

## 3. Design Tokens — Warna

### 3.1 Neutral & Surface

| Token | Hex | Penggunaan |
|---|---|---|
| `ink-950` | `#0D0D11` | Background halaman Landing (dark hero), background Balance Card |
| `ink-900` | `#17171D` | Gradient akhir kartu gelap, hover state di atas ink-950 |
| `surface` | `#F7F6F3` | Background utama app (dashboard, list, form) |
| `surface-muted` | `#EFEDE8` | Background input, table zebra, skeleton loading |
| `card` | `#FFFFFF` | Background card di light theme |
| `border` | `#E7E5E0` | Border kartu, divider list |

### 3.2 Teks

| Token | Hex | Penggunaan |
|---|---|---|
| `text-primary` | `#121214` | Judul, angka utama di light surface |
| `text-secondary` | `#86858C` | Label, caption, timestamp |
| `text-inverse` | `#FFFFFF` | Teks di atas ink-950/indigo |
| `text-inverse-muted` | `#B8B8C4` | Sub-label di atas kartu gelap |

### 3.3 Brand / Accent

| Token | Hex | Penggunaan |
|---|---|---|
| `indigo-600` (primary) | `#4F46E5` | Tombol primer, ikon nav aktif, garis chart income, kartu wallet bank |
| `indigo-700` | `#3F37C9` | Hover/active state indigo |
| `indigo-100` | `#E7E5FB` | Background tint (badge, chip terpilih) |
| `gold-400` (secondary accent) | `#F6C453` | CTA "Mulai Sekarang", tombol refresh, aksen kartu wallet e-wallet |
| `gold-500` | `#EAB123` | Hover gold |

### 3.4 Semantik Keuangan (inti dari prinsip desain §1)

| Token | Hex | Penggunaan |
|---|---|---|
| `income-500` | `#22C55E` | Angka/ikon income (+), status budget "Normal" (0–79%) |
| `income-100` | `#DCFCE7` | Background badge income |
| `expense-500` | `#EF4444` | Angka/ikon expense (−), status budget "Exceeded" (≥100%) |
| `expense-100` | `#FEE2E2` | Background badge expense |
| `warning-500` | `#F59E0B` | Status budget "Warning" (80–99%) |
| `transfer-500` | `#4F46E5` (= indigo-600) | Ikon & panah transfer — netral, tidak pernah hijau/merah |

> Aturan tetap: **transfer tidak boleh memakai warna income/expense** — ini merefleksikan aturan bisnis PRD §7 & §21 bahwa transfer tidak dihitung sebagai income maupun expense.

---

## 4. Tipografi

| Role | Font | Fallback |
|---|---|---|
| Display / Angka besar (saldo, headline landing) | **General Sans** (600–700) | `Inter Tight`, sans-serif |
| UI / Body (label, form, list, nav) | **Inter** (400–500) | system-ui, sans-serif |

Semua angka nominal & persentase menggunakan `font-variant-numeric: tabular-nums` agar kolom angka rapi sejajar (penting untuk daftar transaksi & laporan).

### Type Scale

| Token | Size / Line | Weight | Contoh Pemakaian |
|---|---|---|---|
| `display-2xl` | 40 / 48 | 700 | Headline landing page |
| `display-xl` | 32 / 40 | 700 | Angka Total Balance di Balance Card |
| `heading-lg` | 20 / 28 | 600 | Judul section ("Recent Transactions", "My Wallet") |
| `heading-md` | 16 / 24 | 600 | Judul card kecil, nama wallet |
| `body-md` | 15 / 22 | 400 | Body text, deskripsi form |
| `body-sm` | 13 / 18 | 400 | Timestamp, catatan transaksi |
| `label-xs` | 11 / 16 | 500, uppercase, tracking-wide | Eyebrow label ("TOTAL BALANCE", "INCOME") |

---

## 5. Spacing, Radius & Elevation

```text
Spacing scale (Tailwind default 4px base): 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
```

| Token | Nilai | Penggunaan |
|---|---|---|
| `radius-lg` | 28px | Balance Card, Wallet Card, hero panel |
| `radius-md` | 20px | Card standar (transaction list container, form card) |
| `radius-sm` | 12px | Input, button, chip |
| `radius-pill` | 999px | Bottom nav, segmented control, badge |

| Token | Shadow | Penggunaan |
|---|---|---|
| `shadow-card` | `0 8px 24px rgba(17,17,20,0.06)` | Card putih di atas `surface` |
| `shadow-nav` | `0 12px 32px rgba(17,17,20,0.10)` | Bottom nav mengambang, FAB |
| Kartu gelap (`ink-950`) | tanpa shadow, pakai inset highlight tipis (`1px solid rgba(255,255,255,0.06)`) | Balance Card, Wallet Card bank |

---

## 6. Komponen Inti (dipetakan ke fitur PRD)

### 6.1 Balance / Summary Card — Dashboard §10

Kartu gelap (`ink-950`), radius-lg, dipakai di puncak `/dashboard`.

```text
┌─────────────────────────────┐
│ TOTAL BALANCE            ⋯  │  ← label-xs + menu icon
│ Rp7.250.000                 │  ← display-xl, text-inverse
│                              │
│  Income            Expense  │
│  + Rp6.000.000     − Rp1.750.000
│  (income-500)      (expense-500)
└─────────────────────────────┘
```

Catatan: garis aksen diagonal indigo/putih dari referensi dipakai tipis di background sebagai tekstur, bukan elemen fungsional.

### 6.2 Wallet Card — Wallet CRUD §12

Dua varian berdasarkan `WalletType`:

- **BANK / EWALLET** → kartu gaya "kartu bank" (radius-lg, gradient indigo→gold seperti referensi), menampilkan **Nama Wallet, Tipe, Saldo** (tanpa nomor kartu karena tidak ada di schema).
- **CASH / OTHER** → tile datar putih dengan ikon dompet/uang, radius-md, lebih ringkas.

```text
[BANK]                         [CASH]
┌────────────────────┐        ┌──────────────────┐
│ BCA          ●●     │        │ 💵 Cash           │
│                     │        │ Rp450.000         │
│ Rp4.500.000    IDR  │        └──────────────────┘
└────────────────────┘
```

### 6.3 Transaction List Item — Transaction Requirements §11

```text
[icon]  Category name              + Rp6.000.000   (income-500)
        Wallet · 09:35 AM
```

- Ikon kategori dalam lingkaran kecil (background `indigo-100` untuk expense netral, atau warna kategori bila custom).
- Amount selalu berwarna sesuai tipe: hijau (+) untuk income, merah (−) untuk expense.
- Transfer memakai baris berbeda: `Wallet A → Wallet B` dengan ikon panah indigo, **tanpa tanda +/−**.

### 6.4 Budget Progress — Budget Requirements §15

```text
Food
Rp750.000 / Rp1.000.000
[██████████████░░░░]  75%   → income-500 (Normal)
```

Warna bar mengikuti threshold PRD persis:

| % Terpakai | Warna | Token |
|---|---|---|
| 0–79% | Hijau | `income-500` |
| 80–99% | Kuning/amber | `warning-500` |
| ≥100% | Merah | `expense-500` |

### 6.5 Charts (Recharts) — Dashboard & Reports §10, §16

- **Income vs Expense** (line/bar chart): dua seri warna `income-500` dan `expense-500`.
- **Expense by Category** (donut chart): tiap kategori diberi warna dari palet kategori (lihat §7), dengan `text-secondary` untuk label persentase.
- Grafik tren gaya "waveform" pada referensi (screen 3) **dipakai ulang** sebagai visual tren saldo/pengeluaran mingguan di Reports — bukan sebagai indikator harga investasi.

### 6.6 Navigasi

**Desktop** (mengikuti wireframe PRD §29):

```text
┌──────────────┬─────────────────────────────┐
│ Finora       │                    🔔  ⚫⚪ 👤│  ← theme toggle di header
│ 🏠 Dashboard │                             │
│ 📄 Transactions                            │
│ 👛 Wallets   │        (content)            │
│ 🏷️ Categories│                             │
│ 🎯 Budgets   │                             │
│ 📊 Reports   │                             │
│ ⚙️ Settings  │                             │
└──────────────┴─────────────────────────────┘
```

**Mobile** — bottom nav pill mengambang (`shadow-nav`, `radius-pill`), 5 item sesuai wireframe PRD, tombol tengah menonjol (gold, lebih besar, elevated) untuk aksi utama:

```text
┌─────────────────────────────┐
│  🏠      📊     ➕     💳    👤 │
│ Home  Reports  Add  Wallets Settings
└─────────────────────────────┘
```

Tombol `+` (Add Transaction) memakai `gold-400` dengan icon panah/plus putih — meniru bobot visual tombol "Join Now" pada referensi.

### 6.7 Buttons

| Varian | Style | Contoh |
|---|---|---|
| Primary (dark) | `ink-950` bg, `text-inverse`, radius-pill | "Simpan Transaksi" |
| Accent (gold) | `gold-400` bg, `ink-950` text, radius-pill | CTA landing "Mulai Sekarang", FAB Add |
| Secondary | `surface-muted` bg, `text-primary`, border tipis | "Batal" |
| Destructive | `expense-100` bg, `expense-500` text | "Hapus Wallet/Transaksi" |

### 6.8 Empty & Error States — PRD §31, §32

Ikon garis sederhana (indigo, ukuran besar) + headline `heading-md` + body-sm penjelasan + tombol accent. Contoh dari PRD dipakai apa adanya, hanya diberi styling ikon dan spacing sesuai token di atas (tanpa menambah copy baru di luar yang sudah didefinisikan PRD).

---

## 7. Warna Kategori (Category Icon/Color)

Karena PRD §13 memungkinkan kategori custom dengan `icon` dan `color` opsional, disediakan palet default 8 warna kategori (dipakai bergilir untuk kategori bawaan & custom):

```text
#4F46E5 (indigo)  #22C55E (green)   #F59E0B (amber)  #EF4444 (red)
#0EA5E9 (sky)      #A855F7 (purple)  #F97316 (orange) #64748B (slate)
```

---

## 8. Pemetaan Halaman (Route → Layout)

| Route (PRD §9) | Tema | Komponen Utama |
|---|---|---|
| `/` | Dark hero (`ink-950`) | Headline display-2xl, ilustrasi garis diagonal indigo/putih, CTA gold "Mulai Sekarang" |
| `/login`, `/register` | Light, form terpusat | Card putih radius-md, input, tombol primary |
| `/dashboard` | Light + 1 kartu gelap | Balance Card (§6.1), Income vs Expense chart, Expense by Category chart, Recent Transactions (§6.3), Budget Overview mini (§6.4) |
| `/transactions` | Light | Filter bar (type/kategori/wallet/bulan) + list §6.3 + FAB Add |
| `/transactions/new` | Light, modal/sheet | Segmented control Income/Expense (hijau/merah), input amount besar (display-xl), picker kategori/wallet/tanggal |
| `/wallets` | Light | Grid Wallet Card §6.2 + empty state §31 |
| `/categories` | Light | Tab Income/Expense, grid chip warna+ikon |
| `/budgets` | Light | List Budget Progress §6.4 + empty state |
| `/reports` | Light | Ringkasan periode, top expenses (reuse §6.3), chart breakdown |
| `/settings` | Light | Form profil, **theme toggle (light/dark)** |

---

## 9. Dark / Light Mode

Ikon toggle dua-titik pada referensi dipetakan menjadi **theme switcher** global:

- Diletakkan di header app (kanan atas, sebelah ikon notifikasi) dan diulang di `/settings`.
- Landing page (`/`) tetap dark secara default (identitas brand), tidak ikut mode toggle user.
- App interior (`/dashboard` dst.) default **light**, dengan opsi dark mode yang membalik token: `surface`↔`ink-950`, `card`↔`ink-900`, `text-primary`↔`text-inverse`.

---

## 10. Implementasi Teknis (Tailwind + shadcn/ui)

Sesuai Technology Stack PRD §25.

**`tailwind.config.ts` (extend):**

```ts
theme: {
  extend: {
    colors: {
      ink: { 950: "#0D0D11", 900: "#17171D" },
      surface: { DEFAULT: "#F7F6F3", muted: "#EFEDE8" },
      indigo: { 600: "#4F46E5", 700: "#3F37C9", 100: "#E7E5FB" },
      gold: { 400: "#F6C453", 500: "#EAB123" },
      income: { 500: "#22C55E", 100: "#DCFCE7" },
      expense: { 500: "#EF4444", 100: "#FEE2E2" },
      warning: { 500: "#F59E0B" },
    },
    borderRadius: { lg: "28px", md: "20px", sm: "12px" },
    fontFamily: {
      display: ["General Sans", "Inter Tight", "sans-serif"],
      sans: ["Inter", "system-ui", "sans-serif"],
    },
  },
}
```

**CSS variables (`globals.css`, kompatibel shadcn):**

```css
:root {
  --background: 40 20% 96%;      /* surface */
  --foreground: 240 6% 7%;       /* text-primary */
  --primary: 243 75% 59%;        /* indigo-600 */
  --accent: 43 91% 65%;          /* gold-400 */
  --destructive: 0 84% 60%;      /* expense-500 */
  --radius: 1.25rem;             /* radius-md */
}
.dark {
  --background: 240 12% 6%;      /* ink-950 */
  --foreground: 0 0% 100%;
}
```

Semua angka mata uang di-format lewat satu util `formatIDR()` (`Rp` + titik ribuan) agar konsisten di seluruh komponen — bukan library format USD.

---

## 11. Aksesibilitas & Quality Bar

- Kontras teks putih di atas `ink-950` = ~19:1 (aman, AAA).
- Warna income/expense **tidak boleh jadi satu-satunya penanda** — selalu disertai simbol `+`/`−` agar tetap terbaca oleh pengguna buta warna.
- Semua tombol & item nav punya visible focus ring (`ring-2 ring-indigo-600`).
- Motion terbatas pada micro-interaction (hover, progress bar fill, toggle switch) — hormati `prefers-reduced-motion`, tidak ada animasi besar yang mengganggu keterbacaan angka finansial.

---

**End of DESIGN.md**
