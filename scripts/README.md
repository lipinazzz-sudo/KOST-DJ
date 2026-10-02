# DJ Family Kost — Script Repository

Folder ini khusus untuk **backup/source code Google Apps Script dan script backend** yang dipakai proyek DJ Family Kost.

## Alur kerja

1. Kode yang akan dimasukkan ke sini ditempelkan terlebih dahulu di ChatGPT.
2. Kode diperiksa terhadap versi proyek yang sedang berjalan.
3. Hanya kode yang memang relevan dan aman dijadikan backup yang akan disimpan di folder ini.
4. Setiap file backup diberi nama yang jelas dan dipisahkan berdasarkan fungsi.
5. Saat ada perubahan berikutnya, versi di folder ini menjadi referensi untuk dibandingkan sebelum melakukan perubahan.
6. File di GitHub **tidak otomatis mengubah Google Apps Script**. Setelah source backup diperbarui, kode produksi di Apps Script tetap harus disalin/ditempel dan dideploy sesuai kebutuhan.

## Struktur yang direncanakan

- `scripts/KEUANGAN_API_V1.gs` — backend keuangan
- `scripts/TENANT_API_V2.gs` — backend tenant/auth
- `scripts/...` — script backend lain yang sudah diperiksa dan memang perlu dibackup

## Aturan backup

- Jangan menghapus fungsi yang tidak terkait saat melakukan revisi.
- Jangan menduplikasi fungsi tanpa alasan.
- Jangan menganggap file GitHub sudah live di Apps Script sebelum kode benar-benar ditempel dan deployment diperbarui.
- Setiap perubahan sebaiknya menggunakan commit terpisah agar riwayat perubahan mudah dilacak.
- Script yang belum diperiksa tidak perlu langsung disimpan sebagai backup resmi.

## Status

Folder ini adalah **source-of-truth cadangan** untuk script yang sudah diperiksa, bukan database Google Sheets dan bukan deployment runtime Apps Script.
