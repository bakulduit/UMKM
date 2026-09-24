import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiError } from "@/lib/apiClient";
import { rupiah, shortDate } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import ImageUploader from "@/components/ImageUploader";
import AuthImage from "@/components/AuthImage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, CreditCard, QrCode, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function Subscription() {
  const qc = useQueryClient();
  const { refresh } = useAuth();
  const [payPlan, setPayPlan] = useState(null);
  const [proof, setProof] = useState(null);
  const [busy, setBusy] = useState(false);

  const { data: plansData } = useQuery({ queryKey: ["plans"], queryFn: async () => (await api.get("/subscription/plans")).data });
  const { data: sub, isLoading } = useQuery({ queryKey: ["subscription"], queryFn: async () => (await api.get("/subscription")).data });

  const plans = plansData?.plans || [];
  const status = sub?.subscription?.status;

  const submit = async () => {
    if (!proof) return toast.error("Unggah bukti pembayaran terlebih dahulu");
    setBusy(true);
    try {
      await api.post("/subscription/subscribe", { plan_id: payPlan.id, proof_path: proof });
      toast.success("Bukti pembayaran terkirim! Menunggu verifikasi admin.");
      setPayPlan(null); setProof(null);
      qc.invalidateQueries({ queryKey: ["subscription"] });
      refresh();
    } catch (err) { toast.error(apiError(err.response?.data?.detail)); } finally { setBusy(false); }
  };

  return (
    <div>
      <PageHeader title="Langganan" subtitle="Kelola langganan aplikasi Anda" testid="subscription-header" />

      <Card className="rounded-2xl p-6 mb-6 bg-secondary text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="overline text-white/60">Status Langganan</span>
            <div className="font-heading text-2xl font-extrabold mt-1">
              {status === "trial" ? "Masa Uji Coba" : status === "active" ? "Aktif" : "Berakhir"}
            </div>
            {sub?.subscription?.subscription_end && (
              <div className="text-sm text-white/60 mt-1">Berlaku hingga {shortDate(sub.subscription.subscription_end)}</div>
            )}
          </div>
          <CreditCard className="h-10 w-10 text-primary" />
        </div>
      </Card>

      {isLoading ? <div className="h-40 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((p, i) => (
            <Card key={p.id} className={`rounded-2xl p-6 relative ${i === 1 ? "border-primary border-2" : ""}`} data-testid={`plan-${p.id}`}>
              {i === 1 && <Badge className="absolute top-4 right-4 gap-1"><Sparkles className="h-3 w-3" /> Terbaik</Badge>}
              <h3 className="font-heading font-bold text-xl">{p.name}</h3>
              <div className="font-heading text-3xl font-extrabold text-primary mt-2 tabular">{rupiah(p.price)}</div>
              <div className="text-sm text-muted-foreground">/ {p.days} hari</div>
              <ul className="mt-5 space-y-2">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary" /> {f}</li>
                ))}
              </ul>
              <Button className="w-full mt-6" onClick={() => { setPayPlan(p); setProof(null); }} data-testid={`subscribe-${p.id}`}>Pilih Paket</Button>
            </Card>
          ))}
        </div>
      )}

      {sub?.payments?.length > 0 && (
        <Card className="rounded-2xl p-6 mt-6">
          <h3 className="font-heading font-bold text-lg mb-4">Riwayat Pembayaran</h3>
          <div className="space-y-2">
            {sub.payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                <span>{p.plan_name} · {shortDate(p.created_at)}</span>
                <span className="tabular">{rupiah(p.amount)}</span>
                <Badge variant={p.status === "approved" ? "default" : p.status === "rejected" ? "destructive" : "outline"}>
                  {p.status === "approved" ? "Disetujui" : p.status === "rejected" ? "Ditolak" : "Menunggu"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Dialog open={!!payPlan} onOpenChange={() => setPayPlan(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><QrCode className="h-5 w-5 text-primary" /> Bayar {payPlan?.name} · {rupiah(payPlan?.price)}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Scan QRIS di bawah untuk membayar langganan, lalu unggah bukti pembayaran. Admin akan memverifikasi.</p>
            <div className="rounded-2xl border-2 border-dashed p-4 grid place-items-center bg-muted/40">
              {plansData?.qris_image_path ? (
                <AuthImage path={plansData.qris_image_path} alt="QRIS Platform" className="h-56 w-56 object-contain" />
              ) : (
                <div className="text-sm text-muted-foreground py-10 text-center">QRIS pembayaran belum tersedia. Hubungi admin platform.</div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Unggah Bukti Pembayaran</p>
              <ImageUploader value={proof} onChange={setProof} label="Unggah Bukti" testid="proof" />
            </div>
            <Button className="w-full" onClick={submit} disabled={busy || !proof} data-testid="submit-proof">
              {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Kirim Bukti Pembayaran
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
