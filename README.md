# Presiden Balap Indonesia

Prototype game balap kart arcade yang benar-benar playable di browser, berlatar **Bali Circuit** fiktif. Proyek ini memakai placeholder orisinal berbasis geometri—tidak ada aset dari game lain.

## Menjalankan lokal (dengan renderer 3D)

Prototype memakai **Three.js + WebGL**. Build adalah salinan static tanpa dependency npm; browser memuat modul Three.js melalui import map. Ini membuat build GitHub Pages tetap berjalan meski registry npm tidak tersedia.

```bash
# Opsional: tidak mengunduh dependency apa pun
npm install

# Jalankan static server di http://localhost:5173
npm run dev
```

Alternatif tanpa npm:

```bash
npm run dev
```

Buka [http://localhost:5173](http://localhost:5173) di browser modern. Tidak diperlukan koneksi internet untuk menjalankan game setelah repository tersedia. Jangan membuka `index.html` langsung dengan `file://`; gunakan static server agar perilaku browser konsisten.

## Kontrol

| Aksi | Tombol |
| --- | --- |
| Gas / belok | `WASD` atau tombol panah |
| Rem dan mundur | `S` atau panah bawah |
| Boost | `Shift` atau `Spasi` |

Selesaikan tiga lap untuk melihat hasil balapan. HUD mencakup posisi, waktu, lap, kecepatan, boost, dan mini-map.

## Pilihan teknologi dan arsitektur

**Three.js + WebGL** dipilih pada prototype ini karena environment membatasi registry npm dan CDN. Renderer dependency-free tetap menyediakan kamera follow bergaya third-person, lintasan Bali Circuit, kart, AI, dan HUD, sambil membuat proyek dapat berjalan dari static server biasa. Implementasi Three.js modular yang sebelumnya dibuat tetap tersimpan di `src/game/` sebagai fondasi migrasi renderer 3D saat dependency tersedia.

- `src/data/characters.js`: roster karakter dan statistik sebagai data terpisah.
- `src/data/circuits.js`: definisi sirkuit dan konfigurasi lap.
- `src/game/`: sistem input, lintasan, kart, dan state balapan.
- `src/ui/`: HUD yang dipisahkan dari loop gameplay.

Untuk tahap berikutnya, karakter atau sirkuit baru cukup ditambahkan ke folder `data`, sementara mesh placeholder dapat diganti dengan model/aset berlisensi yang sesuai.

## Deploy ke GitHub Pages

Repository ini adalah static web app: `index.html`, stylesheet, dan seluruh runtime WebGL berada di repository dan tidak membutuhkan backend atau CDN saat dimainkan; dependency dibundel saat build. Workflow [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) memeriksa JavaScript lalu mengunggah `index.html` dan folder `src/` sebagai artifact Pages setiap ada push ke branch `main`.

1. Push/merge commit ke branch `main` di GitHub.
2. Buka **Settings → Pages** pada repository GitHub Anda.
3. Pada **Build and deployment**, pilih **Source: GitHub Actions**. Jika organisasi membatasi Actions/Pages, izinkan workflow deployment terlebih dahulu.
4. Buka tab **Actions**, jalankan atau tunggu workflow **Deploy game to GitHub Pages** sampai selesai.
5. Buka URL yang ditampilkan oleh step **Deploy to GitHub Pages**. Untuk repository project biasa, alamatnya adalah `https://<pemilik-github>.github.io/presiden-balap-indonesia/`.

Semua referensi dari `index.html` memakai path relatif (`./src/...`), sehingga game tetap termuat saat dipublikasikan di subpath GitHub Pages tersebut.
