import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiError } from "@/lib/apiClient";
import { rupiah } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Users, HandCoins, Trash2, Loader2, Phone } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function Customers() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === "umkm_admin";
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", note: "" });
  const [payFor, setPayFor] = useState(null);
  const [payAmt, setPayAmt] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: customers = [], isLoading } = useQuery({ queryKey: ["customers"], queryFn: async () => (await api.get("/customers")).data });

  const save = async () => {
    setBusy(true);
    try {
      await api.post("/customers", form);
      toast.success("Pelanggan ditambahkan");
      setOpen(false); setForm({ name: "", phone: "", note: "" });
      qc.invalidateQueries({ queryKey: ["customers"] });
    } catch (err) { toast.error(apiError(err.response?.data?.detail)); } finally { setBusy(false); }
  };

  const pay = async () => {
    setBusy(true);
    try {
      await api.post(`/customers/${payFor.id}/pay?amount=${Number(payAmt)}`);
      toast.success("Pembayaran kasbon dicatat");
      setPayFor(null); setPayAmt("");
      qc.invalidateQueries({ queryKey: ["customers"] });
    } catch (err) { toast.error(apiError(err.response?.data?.detail)); } finally { setBusy(false); }
  };

  const del = async (id) => {
    if (!window.confirm("Hapus pelanggan ini?")) return;
    await api.delete(`/customers/${id}`);
    qc.invalidateQueries({ queryKey: ["customers"] });
  };

  const totalDebt = customers.reduce((s, c) => s + (c.balance || 0), 0);

  return (
    <div>
      <PageHeader title="Pelanggan & Kasbon" subtitle={`Total piutang: ${rupiah(totalDebt)}`} testid="customers-header"
        action={<Button onClick={() => setOpen(true)} data-testid="add-customer-btn"><Plus className="h-4 w-4 mr-2" /> Tambah Pelanggan</Button>} />

      {isLoading ? (
        <div className="h-48 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : customers.length === 0 ? (
        <Card className="rounded-2xl py-16 text-center text-muted-foreground"><Users className="h-10 w-10 mx-auto mb-3 opacity-50" /> Belum ada pelanggan.</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((c) => (
            <Card key={c.id} className="rounded-2xl p-5" data-testid={`customer-${c.id}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-heading font-bold text-lg">{c.name}</div>
                  {c.phone && <div className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" /> {c.phone}</div>}
                </div>
                {isAdmin && <button onClick={() => del(c.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>}
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="overline text-muted-foreground">Sisa Kasbon</div>
                  <div className={`font-heading text-xl font-extrabold tabular ${c.balance > 0 ? "text-destructive" : "text-primary"}`}>{rupiah(c.balance)}</div>
                </div>
                {c.balance > 0 && (
                  <Button size="sm" variant="outline" onClick={() => { setPayFor(c); setPayAmt(String(c.balance)); }} data-testid={`pay-${c.id}`}>
                    <HandCoins className="h-4 w-4 mr-1" /> Lunasi
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tambah Pelanggan</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Nama</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="customer-name" /></div>
            <div className="space-y-2"><Label>No. HP</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="space-y-2"><Label>Catatan</Label><Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={save} disabled={busy || !form.name} data-testid="save-customer">{busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!payFor} onOpenChange={() => setPayFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Lunasi Kasbon · {payFor?.name}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Jumlah Bayar</Label>
            <Input type="number" value={payAmt} onChange={(e) => setPayAmt(e.target.value)} data-testid="pay-amount" />
            <p className="text-xs text-muted-foreground">Sisa kasbon saat ini: {rupiah(payFor?.balance)}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayFor(null)}>Batal</Button>
            <Button onClick={pay} disabled={busy || !payAmt} data-testid="confirm-pay">{busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Catat Pembayaran</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
