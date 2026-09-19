# Presiden Balap Indonesia

Prototype game balap kart arcade yang benar-benar playable di browser, berlatar **Bali Circuit** fiktif. Proyek ini memakai placeholder orisinal berbasis geometri—tidak ada aset dari game lain.

## Menjalankan lokal

Prototype memakai **Three.js + WebGL**. Build menghasilkan static web app yang dapat dijalankan melalui static server. Implementasi game dan sistem gameplay berada di dalam repository.

```bash
# Opsional
npm install

# Jalankan development server
npm run dev
```

Buka `http://localhost:5173` di browser modern. Jangan membuka `index.html` langsung dengan `file://`; gunakan static server agar perilaku browser konsisten.

## Kontrol

| Aksi           | Tombol                   |
| -------------- | ------------------------ |
| Gas / belok    | `WASD` atau tombol panah |
| Rem dan mundur | `S` atau panah bawah     |
| Boost          | `Shift` atau `Spasi`     |

Selesaikan tiga lap untuk melihat hasil balapan. HUD mencakup posisi, waktu, lap, kecepatan, boost, dan mini-map.

## Pilihan teknologi dan arsitektur

**Three.js + WebGL** digunakan sebagai renderer 3D untuk prototype. Sistem ini menyediakan kamera follow bergaya third-person, lintasan Bali Circuit, kart, AI, dan HUD.

Struktur utama proyek:

* `src/data/characters.js`: roster karakter dan statistik sebagai data terpisah.
* `src/data/circuits.js`: definisi sirkuit dan konfigurasi lap.
* `src/game/`: sistem input, lintasan, kart, dan state balapan.
* `src/ui/`: HUD yang dipisahkan dari loop gameplay.

Untuk tahap berikutnya, karakter atau sirkuit baru cukup ditambahkan ke folder `data`, sementara mesh placeholder dapat diganti dengan model/aset berlisensi yang sesuai.

## Build

Untuk membuat versi production:

```bash
npm run build
```

Hasil build akan dibuat di folder `dist/`.

## Deploy ke GitHub Pages

Repository ini adalah static web app. Workflow [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) akan menjalankan build dan mengunggah hasil build dari folder `dist/` sebagai artifact GitHub Pages setiap ada push ke branch `main`.

1. Push/merge commit ke branch `main` di GitHub.
2. Buka **Settings → Pages** pada repository GitHub.
3. Pada **Build and deployment**, pilih **Source: GitHub Actions**.
4. Buka tab **Actions** dan tunggu workflow **Deploy game to GitHub Pages** selesai.
5. Buka URL yang ditampilkan oleh step **Deploy to GitHub Pages**.

Untuk repository project biasa, alamatnya berbentuk:

```text
https://<pemilik-github>.github.io/presiden-balap-indonesia/
```

Semua referensi dari `index.html` menggunakan path relatif sehingga game dapat dimuat saat dipublikasikan melalui GitHub Pages.
