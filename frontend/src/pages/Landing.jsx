import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Wallet, ShoppingCart, QrCode, BellRing, BarChart3, ShieldCheck,
  Package, Users, ArrowRight, Check, Store, FileSpreadsheet,
} from "lucide-react";

const HERO = "https://images.pexels.com/photos/37042747/pexels-photo-37042747.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";
const PAY = "https://images.pexels.com/photos/12935051/pexels-photo-12935051.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

const features = [
  { icon: ShoppingCart, title: "Kasir Cepat (POS)", desc: "Catat penjualan, hitung kembalian, dan pilih metode pembayaran dalam hitungan detik." },
  { icon: QrCode, title: "Pembayaran QRIS", desc: "Tempel QRIS toko Anda. Pelanggan scan, kasir konfirmasi, transaksi tercatat." },
  { icon: BellRing, title: "Notifikasi Suara", desc: "Dengar 'uang masuk' otomatis setiap pembayaran diterima — tanpa perlu menatap layar." },
  { icon: BarChart3, title: "Dashboard Keuangan", desc: "Pemasukan, pengeluaran, laba, dan produk terlaris dalam satu tampilan." },
  { icon: Package, title: "Stok & Produk", desc: "Kelola produk lengkap dengan peringatan stok menipis otomatis." },
  { icon: Users, title: "Kasbon Pelanggan", desc: "Catat utang/piutang pelanggan dan pantau pelunasannya dengan rapi." },
  { icon: FileSpreadsheet, title: "Laporan Resmi", desc: "Laba-rugi & arus kas siap ekspor PDF/Excel untuk lembaga keuangan." },
  { icon: Store, title: "Multi-Outlet", desc: "Kelola beberapa cabang dan banyak akun kasir dari satu pemilik." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-secondary">
      {/* Nav */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary grid place-items-center">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <span className="font-heading font-extrabold text-lg">UMKM Pay</span>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" data-testid="nav-login">Masuk</Button></Link>
            <Link to="/register"><Button data-testid="nav-register">Coba Gratis</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid lg:grid-cols-2 gap-12 items-center">
        <div className="animate-fade-up">
          <span className="overline text-primary">Aplikasi Keuangan UMKM Indonesia</span>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter leading-tight mt-4">
            Kelola kasir & keuangan usaha, <span className="text-primary">semudah scan QRIS.</span>
          </h1>
          <p className="text-muted-foreground text-lg mt-6 leading-relaxed max-w-lg">
            Satu aplikasi untuk mencatat pemasukan-pengeluaran, terima pembayaran QRIS dengan notifikasi suara, dan laporan keuangan yang bisa dipertanggungjawabkan.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link to="/register"><Button size="lg" className="rounded-full" data-testid="hero-register">
              Mulai Uji Coba 14 Hari <ArrowRight className="h-4 w-4 ml-2" />
            </Button></Link>
            <Link to="/login"><Button size="lg" variant="outline" className="rounded-full" data-testid="hero-login">Sudah punya akun</Button></Link>
          </div>
          <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Tanpa kartu kredit</span>
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Data aman</span>
          </div>
        </div>
        <div className="relative">
          <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white rotate-1">
            <img src={HERO} alt="UMKM pasar" className="w-full h-[420px] object-cover" />
          </div>
          <div className="absolute -bottom-6 -left-4 bg-white rounded-2xl shadow-xl border p-4 w-56 -rotate-2 hidden sm:block">
            <div className="flex items-center gap-2 text-primary">
              <BellRing className="h-5 w-5" />
              <span className="font-heading font-bold">Uang Masuk!</span>
            </div>
            <div className="text-2xl font-heading font-extrabold mt-1 tabular">Rp 150.000</div>
            <div className="text-xs text-muted-foreground">via QRIS · barusan</div>
          </div>
        </div>
      </section>

      {/* Features bento */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="max-w-2xl">
          <span className="overline text-primary">Fitur Lengkap</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight mt-3">
            Semua kebutuhan keuangan UMKM, dalam satu genggaman
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl border p-6 hover:shadow-lg hover:-translate-y-1 transition-transform duration-200">
              <div className="h-11 w-11 rounded-xl bg-accent grid place-items-center text-accent-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-heading font-bold text-lg mt-4">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Payment showcase */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-center">
        <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white">
          <img src={PAY} alt="Pembayaran QRIS" className="w-full h-[380px] object-cover" />
        </div>
        <div>
          <span className="overline text-primary">Cara Kerja</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight mt-3">Bayar langganan lewat QRIS, langsung aktif</h2>
          <ol className="mt-8 space-y-5">
            {["Daftar & nikmati uji coba 14 hari gratis.", "Perpanjang dengan scan QRIS kami dan unggah bukti bayar.", "Tempel QRIS toko Anda untuk menerima pembayaran pelanggan.", "Dengar notifikasi suara setiap uang masuk."].map((s, i) => (
              <li key={i} className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-primary text-white grid place-items-center font-bold shrink-0">{i + 1}</div>
                <p className="text-muted-foreground pt-1">{s}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="rounded-3xl bg-secondary text-white p-10 lg:p-16 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">Siap membuat usaha Anda lebih tertata?</h2>
          <p className="text-white/70 mt-4 max-w-xl mx-auto">Ribuan UMKM mulai dari sini. Gratis 14 hari, tanpa risiko.</p>
          <Link to="/register"><Button size="lg" className="rounded-full mt-8" data-testid="cta-register">Daftar Sekarang <ArrowRight className="h-4 w-4 ml-2" /></Button></Link>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} UMKM Pay — Aplikasi Keuangan & Kasir untuk UMKM Indonesia.
      </footer>
    </div>
  );
}
