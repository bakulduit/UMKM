import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiError } from "@/lib/apiClient";
import { shortDate } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, UserCog, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Cashiers() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);

  const { data: cashiers = [], isLoading } = useQuery({ queryKey: ["cashiers"], queryFn: async () => (await api.get("/cashiers")).data });

  const save = async () => {
    setBusy(true);
    try {
      await api.post("/cashiers", form);
      toast.success("Akun kasir dibuat");
      setOpen(false); setForm({ name: "", email: "", password: "" });
      qc.invalidateQueries({ queryKey: ["cashiers"] });
    } catch (err) { toast.error(apiError(err.response?.data?.detail)); } finally { setBusy(false); }
  };
  const del = async (id) => {
    if (!window.confirm("Hapus akun kasir ini?")) return;
    await api.delete(`/cashiers/${id}`);
    qc.invalidateQueries({ queryKey: ["cashiers"] });
  };

  return (
    <div>
      <PageHeader title="Akun Kasir" subtitle="Buat akun untuk karyawan yang menjaga kasir" testid="cashiers-header"
        action={<Button onClick={() => setOpen(true)} data-testid="add-cashier-btn"><Plus className="h-4 w-4 mr-2" /> Tambah Kasir</Button>} />

      <Card className="rounded-2xl overflow-hidden">
        {isLoading ? <div className="h-48 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> :
          cashiers.length === 0 ? <div className="py-16 text-center text-muted-foreground"><UserCog className="h-10 w-10 mx-auto mb-3 opacity-50" /> Belum ada akun kasir.</div> : (
            <Table>
              <TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Email</TableHead><TableHead>Dibuat</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
              <TableBody>
                {cashiers.map((c) => (
                  <TableRow key={c.id} data-testid={`cashier-${c.id}`}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{shortDate(c.created_at)}</TableCell>
                    <TableCell className="text-right"><Button size="icon" variant="ghost" onClick={() => del(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tambah Akun Kasir</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Nama Kasir</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="cashier-name" /></div>
            <div className="space-y-2"><Label>Email Login</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="cashier-email" /></div>
            <div className="space-y-2"><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} data-testid="cashier-password" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={save} disabled={busy || !form.name || !form.email || !form.password} data-testid="save-cashier">{busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Buat Akun</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
