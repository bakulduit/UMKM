# UMKM Pay — Product Requirements (PRD)

## Original Problem Statement
Web app SaaS untuk UMKM Indonesia: pemilik web app sebagai super admin menjual langganan aplikasi keuangan (kasir) ke UMKM lewat pembayaran QRIS. Pemilik UMKM (admin) melihat seluruh aktivitas kasir; kasir memegang pemasukan & pengeluaran. Lengkap: dashboard summary, produk, laporan keuangan yang bisa dipertanggungjawabkan ke lembaga keuangan, pembayaran QRIS di kasir, dan notifikasi uang masuk dengan suara. UMKM bayar langganan via QRIS milik super admin; UMKM juga menempel QRIS mereka untuk pembayaran pelanggan.

## Architecture
- Backend: FastAPI (`/app/backend/server.py`), MongoDB (motor). JWT Bearer auth (localStorage token). Object storage (Emergent) for images.
- Frontend: React + React Router + TanStack Query + Tailwind + Shadcn UI + Recharts. Bahasa Indonesia.
- Roles: `super_admin`, `umkm_admin`, `cashier`. Multi-tenant via `umkm_id` on all business data.

## User Personas
- Super Admin (platform owner, nashoharizal@gmail.com): manage tenants, approve QRIS subscription payments, set platform QRIS/plans.
- UMKM Admin: full financial app — dashboard, products, POS, reports, customers/kasbon, outlets, cashier accounts, store QRIS, subscription.
- Cashier: POS, customers/kasbon, own transaction history only.

## Core Requirements (static)
- JWT email/password auth with role-based access + tenant isolation.
- POS: cart, cash/QRIS payment, discount, kasbon, sound notification on money-in, stock decrement.
- Products & stock with low-stock alerts.
- Financial dashboard (income/expense/profit, 7-day cashflow, top products, receivables).
- Reports: profit-loss & cash-flow + Excel/PDF export.
- Customers & receivables (kasbon) with payment recording.
- Multi-outlet.
- Subscription: trial 14 days; pay via platform QRIS + upload proof; super admin approve/reject; suspend tenant.
- Image upload for product/QRIS/proof via object storage.

## Implemented (2026-06-24)
- All core requirements above implemented and tested. Backend 28/28 tests pass; frontend critical flows pass.
- Landing/marketing page, login, register.
- Super admin: dashboard stats, manage UMKM (suspend/activate), verify payments, platform settings + QRIS.
- UMKM admin: dashboard, POS, products, customers/kasbon, reports+export, history+expenses, outlets, cashiers, subscription, store settings/QRIS.
- Cashier: POS, customers, own history.

## Backlog (not yet built)
- P1: Struk/receipt printing & WhatsApp share; automatic QRIS gateway (Midtrans/Xendit) for dynamic amounts.
- P1: Per-outlet reporting filters and stock-per-outlet.
- P2: Purchase/restock module & supplier management; tax (PPN) presets; email notifications (Resend).
- P2: Split routers for maintainability; signed short-lived download URLs.

## Next Tasks
- Gather user feedback on POS flow & reports.
- Consider receipt printing and dynamic QRIS gateway as first paid-tier upgrades.
