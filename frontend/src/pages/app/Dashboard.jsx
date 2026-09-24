import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/apiClient";
import { rupiah } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import OutletSelect from "@/components/OutletSelect";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, ShoppingBag, AlertTriangle, HandCoins, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";

export default function Dashboard() {
  const [outlet, setOutlet] = useState("all");
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", outlet],
    queryFn: async () => (await api.get(`/dashboard/summary${outlet !== "all" ? `?outlet_id=${outlet}` : ""}`)).data,
  });

  if (isLoading || !data)
    return <div className="h-96 grid place-items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <PageHeader title="Dashboard Keuangan" subtitle="Ringkasan aktivitas usaha Anda" testid="dashboard-header"
        action={<OutletSelect value={outlet} onChange={setOutlet} className="w-48" testid="dashboard-outlet" />} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Wallet} tone="primary" label="Total Pemasukan" value={rupiah(data.income)} sub={`Hari ini: ${rupiah(data.today_income)}`} testid="stat-income" />
        <StatCard icon={TrendingDown} label="Total Pengeluaran" value={rupiah(data.expense)} testid="stat-expense" />
        <StatCard icon={TrendingUp} tone="dark" label="Laba Bersih" value={rupiah(data.profit)} sub={`${data.sale_count} transaksi`} testid="stat-profit" />
        <StatCard icon={HandCoins} label="Piutang (Kasbon)" value={rupiah(data.receivables)} testid="stat-receivables" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card className="lg:col-span-2 rounded-2xl p-6">
          <h3 className="font-heading font-bold text-lg mb-4">Arus Kas 7 Hari Terakhir</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.series}>
              <defs>
                <linearGradient id="inc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160 84% 39%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(160 84% 39%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(214 20% 90%)" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
              <Tooltip formatter={(v) => rupiah(v)} />
              <Area type="monotone" dataKey="income" name="Pemasukan" stroke="hsl(160 84% 39%)" strokeWidth={2.5} fill="url(#inc)" />
              <Area type="monotone" dataKey="expense" name="Pengeluaran" stroke="hsl(38 92% 50%)" strokeWidth={2} fillOpacity={0} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="rounded-2xl p-6">
          <h3 className="font-heading font-bold text-lg mb-4">Produk Terlaris</h3>
          {data.top_products.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada penjualan.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.top_products} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v) => `${v} terjual`} />
                <Bar dataKey="qty" fill="hsl(160 84% 39%)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <StatCard icon={ShoppingBag} label="Jumlah Produk" value={data.product_count} testid="stat-products" />
        <Card className="lg:col-span-2 rounded-2xl p-6" data-testid="low-stock-card">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h3 className="font-heading font-bold text-lg">Stok Menipis ({data.low_stock_count})</h3>
          </div>
          {data.low_stock.length === 0 ? (
            <p className="text-sm text-muted-foreground">Semua stok aman 👍</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.low_stock.map((p) => (
                <span key={p.id} className="text-sm px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  {p.name} · sisa {p.stock}
                </span>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
