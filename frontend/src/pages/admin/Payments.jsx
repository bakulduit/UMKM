import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { rupiah, shortDate } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import AuthImage from "@/components/AuthImage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, BadgeCheck, Check, X, Eye } from "lucide-react";
import { toast } from "sonner";

export default function Payments() {
  const qc = useQueryClient();
  const [proof, setProof] = useState(null);
  const { data: subs = [], isLoading } = useQuery({ queryKey: ["admin-subs"], queryFn: async () => (await api.get("/admin/subscriptions")).data });

  const act = async (id, action) => {
    await api.post(`/admin/subscriptions/${id}/${action}`);
    toast.success(action === "approve" ? "Pembayaran disetujui, langganan aktif" : "Pembayaran ditolak");
    qc.invalidateQueries();
  };

  return (
    <div>
      <PageHeader title="Verifikasi Pembayaran" subtitle="Setujui pembayaran langganan dari UMKM" testid="payments-header" />
      {isLoading ? <div className="h-48 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> :
        subs.length === 0 ? <Card className="rounded-2xl py-16 text-center text-muted-foreground"><BadgeCheck className="h-10 w-10 mx-auto mb-3 opacity-50" /> Belum ada pembayaran.</Card> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subs.map((s) => (
              <Card key={s.id} className="rounded-2xl p-5" data-testid={`payment-${s.id}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-heading font-bold">{s.umkm_name}</div>
                    <div className="text-sm text-muted-foreground">{s.plan_name}</div>
                  </div>
                  <Badge variant={s.status === "approved" ? "default" : s.status === "rejected" ? "destructive" : "outline"}>
                    {s.status === "approved" ? "Disetujui" : s.status === "rejected" ? "Ditolak" : "Menunggu"}
                  </Badge>
                </div>
                <div className="font-heading text-2xl font-extrabold text-primary mt-3 tabular">{rupiah(s.amount)}</div>
                <div className="text-xs text-muted-foreground">{shortDate(s.created_at)}</div>
                <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => setProof(s.proof_path)} data-testid={`view-proof-${s.id}`}>
                  <Eye className="h-4 w-4 mr-2" /> Lihat Bukti
                </Button>
                {s.status === "pending" && (
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="flex-1" onClick={() => act(s.id, "approve")} data-testid={`approve-${s.id}`}><Check className="h-4 w-4 mr-1" /> Setujui</Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => act(s.id, "reject")} data-testid={`reject-${s.id}`}><X className="h-4 w-4 mr-1" /> Tolak</Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

      <Dialog open={!!proof} onOpenChange={() => setProof(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Bukti Pembayaran</DialogTitle></DialogHeader>
          <AuthImage path={proof} alt="Bukti" className="w-full max-h-[70vh] object-contain rounded-xl" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
