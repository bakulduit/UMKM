import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { rupiah } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Building2, BadgeCheck, Clock, Wallet, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function SuperDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: async () => (await api.get("/admin/stats")).data });

  if (isLoading || !data) return <div className="h-96 grid place-items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <PageHeader title="Panel Super Admin" subtitle="Ringkasan platform UMKM Pay" testid="super-dashboard-header" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Building2} tone="dark" label="Total UMKM" value={data.total_umkm} testid="stat-total-umkm" />
        <StatCard icon={BadgeCheck} tone="primary" label="Langganan Aktif" value={data.active_umkm} testid="stat-active-umkm" />
        <StatCard icon={Clock} label="Pembayaran Pending" value={data.pending_payments} testid="stat-pending" />
        <StatCard icon={Wallet} label="Total Pendapatan" value={rupiah(data.total_revenue)} testid="stat-revenue" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="rounded-2xl p-6">
          <h3 className="font-heading font-bold text-lg">Verifikasi Pembayaran</h3>
          <p className="text-sm text-muted-foreground mt-1">Ada {data.pending_payments} pembayaran langganan menunggu persetujuan.</p>
          <Link to="/admin/payments"><Button className="mt-4" data-testid="go-payments">Kelola Pembayaran</Button></Link>
        </Card>
        <Card className="rounded-2xl p-6">
          <h3 className="font-heading font-bold text-lg">Kelola UMKM</h3>
          <p className="text-sm text-muted-foreground mt-1">Lihat seluruh UMKM terdaftar dan status langganannya.</p>
          <Link to="/admin/umkm"><Button variant="outline" className="mt-4" data-testid="go-umkm">Lihat UMKM</Button></Link>
        </Card>
      </div>
    </div>
  );
}
