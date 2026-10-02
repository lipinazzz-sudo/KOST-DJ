# DJ Family Kost — Script Repository

Folder ini khusus untuk **backup/source code Google Apps Script dan script backend** yang dipakai proyek DJ Family Kost.

## Alur kerja

1. Kode yang akan dimasukkan ke sini ditempelkan terlebih dahulu di ChatGPT.
2. Kode diperiksa terhadap versi proyek yang sedang berjalan.
3. Hanya kode yang memang relevan dan aman dijadikan backup yang akan disimpan di folder ini.
4. Kode produksi disimpan dengan **nama file yang sama** seperti di Google Apps Script agar mudah dicari kembali.
5. Saat ada perubahan berikutnya, versi di folder ini menjadi referensi untuk dibandingkan sebelum melakukan perubahan.
6. File di GitHub **tidak otomatis mengubah Google Apps Script**. Setelah source backup diperbarui, kode produksi di Apps Script tetap harus disalin/ditempel dan dideploy sesuai kebutuhan.

## Official backup

Semua script resmi yang sudah dibackup dikumpulkan di folder `scripts/` berikut:

- `09_FINAL_AUDIT_DJ39.gs`
- `APPROVAL_ENGINE_V2.gs`
- `CLEAN_MAINTENANCE_TEST_DATA_V1.gs`
- `DASHBOARD_ENGINE.gs`
- `DIGITAL_CONTRACT_ARCHIVE_V1.gs`
- `EMAIL_NOTIFICATION_DJ39.gs`
- `EMAIL_PAYMENT_REMINDER_DJ39.gs`
- `KEUANGAN_API_V1.gs`
- `LAUNDRY_HISTORY_ENGINE_V1.gs`
- `MASTER_ACCOUNT_V2.gs`
- `MASTER_API_FINANCE_ROUTER_PATCH_V1.gs`
- `MASTER_ENGINE_V2.gs`
- `PAYMENT_ENGINE_DJ39_V2.gs`
- `PAYMENT_LIFECYCLE_AUDIT_DJ39.gs`
- `PAYMENT_PROOF_V2.gs`
- `RESET_PRODUCTION_EMPTY_DJFK_V1.gs`
- `SYSTEM_TOOLS_V2.gs.gs`
- `TENANT_ACCOUNT_V2.gs`
- `TENANT_API_V2.gs`
- `TENANT_REVISION_ENGINE_V1.gs`
- `WHATSAPP_AUTO_DJ39.gs`

**Total: 21 official backup files.**

## Aturan backup

- Jangan menghapus fungsi yang tidak terkait saat melakukan revisi.
- Jangan menduplikasi fungsi tanpa alasan.
- Jangan menganggap file GitHub sudah live di Apps Script sebelum kode benar-benar ditempel dan deployment diperbarui.
- Setiap perubahan sebaiknya menggunakan commit terpisah agar riwayat perubahan mudah dilacak.
- Script test/repair tidak otomatis dimasukkan ke official backup kecuali memang diminta.
- Nama file asli Apps Script dipertahankan agar tidak membingungkan saat dipindahkan kembali ke proyek.

## Status

Folder ini adalah **source-of-truth cadangan** untuk script yang sudah diperiksa, bukan database Google Sheets dan bukan deployment runtime Apps Script.
