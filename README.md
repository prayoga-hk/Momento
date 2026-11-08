
# MEMENTO 64 — Retro Memory Match

Game mencocokkan memori (memory match) bergaya konsol genggam 90-an. Dibuat menggunakan **Vue 3** dan CSS murni. Tanpa backend dan tanpa database — tinggal buka dan mainkan.

## Cara Menjalankan

1. **Via XAMPP:** Nyalakan Apache di XAMPP, lalu buka `http://localhost/simplegame/`.
2. **Langsung:** Buka file `index.html` di browser. Vue dan font sudah tersedia secara lokal, jadi tidak perlu koneksi internet atau proses *build*.

## Fitur Utama

- **Vue 3** (production build lokal, dimuat via tag `<script>`).
- **Tampilan Retro:** UI konsol 90-an dengan efek layar CRT, garis *scanline*, tombol tebal, dan font piksel.
- **Tingkat Kesulitan & Papan:** Tiga ukuran papan — Easy (6 pasang), Medium (8 pasang), Hard (10 pasang).
- **Desain Kartu:** Mode Hard menggunakan stiker wokee dana masuk boskyuh, nipukah, cek pm ya boskyuh yang sedang ramai saat ini dengan *badge* yang berbeda-beda. Mode Easy dan Medium menggunakan desain *glyph* neon.
- **Interaksi & Skor:** Animasi kartu berputar, umpan balik saat cocok, serta panel waktu, langkah, dan skor.
- **Rekor Pribadi:** Skor terbaik per tingkat kesulitan disimpan di `localStorage` (`memento.best.v1`).
- **Aksesibilitas:** Layout responsif, kartu bisa diakses via keyboard, dan mendukung fitur *reduced-motion*.

## Struktur File

- **`index.html`** — Markup aplikasi dan template Vue.
- **`styles.css`** — Desain konsol retro dan layout responsif.
- **`app.js`** — State dan logika game.
- **`vue.global.prod.js`** — Runtime Vue 3 lokal.
- **`fonts/`** — Font lokal (Press Start 2P & VT323) beserta lisensi OFL.
- **`stickers/`** — Aset gambar stiker JB untuk kartu.

## Catatan Stiker

Stiker di mode Hard adalah karya seni meme pihak ketiga. Pastikan Anda memeriksa hak penggunaan ingin mendistribusikan game ini secara berbayar.

---
*Tanpa database, tanpa kode server, tanpa akun.*