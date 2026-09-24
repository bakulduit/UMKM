import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, API } from "@/lib/apiClient";
import { rupiah } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import OutletSelect from "@/components/OutletSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { FileSpreadsheet, FileText, Loader2, TrendingUp, TrendingDown, Wallet } from "lucide-react";

export default function Reports() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [outlet, setOutlet] = useState("all");

  const qs = new URLSearchParams();
  if (start) qs.set("start", start);
  if (end) qs.set("end", end);
  if (outlet !== "all") qs.set("outlet_id", outlet);

  const { data, isLoading } = useQuery({
    queryKey: ["report", start, end, outlet],
    queryFn: async () => (await api.get(`/reports/summary?${qs.toString()}`)).data,
  });

  const download = (format) => {
    const params = new URLSearchParams(qs);
    params.set("format", format);
    params.set("auth", localStorage.getItem("token"));
    window.open(`${API}/reports/export?${params.toString()}`, "_blank");
  };

  return (
    <div>
      <PageHeader title="Laporan Keuangan" subtitle="Laba-rugi & arus kas yang dapat dipertanggungjawabkan" testid="reports-header" />

      <Card className="rounded-2xl p-6 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2"><Label>Dari Tanggal</Label><Input type="date" value={start} onChange={(e) => setStart(e.target.value)} data-testid="report-start" /></div>
          <div className="space-y-2"><Label>Sampai Tanggal</Label><Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} data-testid="report-end" /></div>
          <div className="space-y-2"><Label>Outlet</Label><OutletSelect value={outlet} onChange={setOutlet} className="w-44" testid="report-outlet" /></div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={() => download("excel")} data-testid="export-excel"><FileSpreadsheet className="h-4 w-4 mr-2" /> Excel</Button>
            <Button variant="outline" onClick={() => download("pdf")} data-testid="export-pdf"><FileText className="h-4 w-4 mr-2" /> PDF</Button>
          </div>
        </div>
      </Card>

      {isLoading || !data ? (
        <div className="h-48 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-2xl p-6" data-testid="profit-loss-card">
            <div className="flex items-center gap-2 mb-4"><TrendingUp className="h-5 w-5 text-primary" /><h3 className="font-heading font-bold text-lg">Laporan Laba Rugi</h3></div>
            <dl className="space-y-3 text-sm">
              <Row label="Pendapatan (Penjualan)" value={rupiah(data.revenue)} />
              <Row label="Harga Pokok Penjualan (HPP)" value={`- ${rupiah(data.cogs)}`} muted />
              <Row label="Laba Kotor" value={rupiah(data.gross_profit)} bold />
              <div className="pt-2 border-t">
                {Object.entries(data.expenses_by_category).map(([k, v]) => <Row key={k} label={`Beban: ${k}`} value={`- ${rupiah(v)}`} muted />)}
                {Object.keys(data.expenses_by_category).length === 0 && <p className="text-muted-foreground text-xs">Belum ada beban tercatat.</p>}
              </div>
              <Row label="Total Beban" value={`- ${rupiah(data.total_expense)}`} muted />
              <div className="pt-3 border-t-2 border-secondary">
                <Row label="Laba Bersih" value={rupiah(data.net_profit)} bold big />
              </div>
            </dl>
          </Card>

          <Card className="rounded-2xl p-6" data-testid="cashflow-card">
            <div className="flex items-center gap-2 mb-4"><Wallet className="h-5 w-5 text-primary" /><h3 className="font-heading font-bold text-lg">Laporan Arus Kas</h3></div>
            <dl className="space-y-3 text-sm">
              <Row label="Kas Masuk (tunai/QRIS)" value={rupiah(data.cash_in)} />
              <Row label="Pembelian Stok" value={`- ${rupiah(data.purchases)}`} muted />
              <Row label="Kas Keluar (total)" value={`- ${rupiah(data.cash_out)}`} muted />
              <div className="pt-3 border-t-2 border-secondary">
                <Row label="Arus Kas Bersih" value={rupiah(data.net_cash_flow)} bold big />
              </div>
              <p className="text-xs text-muted-foreground pt-2">Total {data.transaction_count} transaksi pada periode ini.</p>
            </dl>
          </Card>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, muted, bold, big }) {
  return (
    <div className="flex justify-between items-center">
      <dt className={muted ? "text-muted-foreground" : ""}>{label}</dt>
      <dd className={`tabular ${bold ? "font-bold" : ""} ${big ? "font-heading text-xl text-primary" : ""}`}>{value}</dd>
    </div>
  );
}
