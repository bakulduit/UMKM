import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiError } from "@/lib/apiClient";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Store, Trash2, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function Outlets() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", address: "" });
  const [busy, setBusy] = useState(false);

  const { data: outlets = [], isLoading } = useQuery({ queryKey: ["outlets"], queryFn: async () => (await api.get("/outlets")).data });

  const save = async () => {
    setBusy(true);
    try {
      await api.post("/outlets", form);
      toast.success("Outlet ditambahkan");
      setOpen(false); setForm({ name: "", address: "" });
      qc.invalidateQueries({ queryKey: ["outlets"] });
    } catch (err) { toast.error(apiError(err.response?.data?.detail)); } finally { setBusy(false); }
  };
  const del = async (id) => {
    if (!window.confirm("Hapus outlet ini?")) return;
    await api.delete(`/outlets/${id}`);
    qc.invalidateQueries({ queryKey: ["outlets"] });
  };

  return (
    <div>
      <PageHeader title="Outlet / Cabang" subtitle="Kelola lokasi usaha Anda" testid="outlets-header"
        action={<Button onClick={() => setOpen(true)} data-testid="add-outlet-btn"><Plus className="h-4 w-4 mr-2" /> Tambah Outlet</Button>} />

      {isLoading ? <div className="h-48 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {outlets.map((o) => (
            <Card key={o.id} className="rounded-2xl p-5" data-testid={`outlet-${o.id}`}>
              <div className="flex items-start justify-between">
                <div className="h-11 w-11 rounded-xl bg-accent grid place-items-center text-accent-foreground"><Store className="h-5 w-5" /></div>
                <button onClick={() => del(o.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
              <div className="font-heading font-bold text-lg mt-3">{o.name}</div>
              {o.address && <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> {o.address}</div>}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tambah Outlet</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Nama Outlet</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="outlet-name" /></div>
            <div className="space-y-2"><Label>Alamat</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={save} disabled={busy || !form.name} data-testid="save-outlet">{busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
