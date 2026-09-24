import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiError } from "@/lib/apiClient";
import { rupiah, shortDate } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Trash2, Loader2, Truck, PackagePlus, X } from "lucide-react";
import { toast } from "sonner";

export default function Purchases() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [supOpen, setSupOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const { data: purchases = [], isLoading } = useQuery({ queryKey: ["purchases"], queryFn: async () => (await api.get("/purchases")).data });
  const { data: suppliers = [] } = useQuery({ queryKey: ["suppliers"], queryFn: async () => (await api.get("/suppliers")).data });
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: async () => (await api.get("/products")).data });
  const { data: outlets = [] } = useQuery({ queryKey: ["outlets"], queryFn: async () => (await api.get("/outlets")).data });

  // purchase form
  const [supplierId, setSupplierId] = useState("none");
  const [outletId, setOutletId] = useState("none");
  const [payMethod, setPayMethod] = useState("cash");
  const [lines, setLines] = useState([]);
  const [pick, setPick] = useState("");
  const [note, setNote] = useState("");

  const total = useMemo(() => lines.reduce((s, l) => s + Number(l.cost) * Number(l.qty), 0), [lines]);

  const addLine = () => {
    const p = products.find((x) => x.id === pick);
    if (!p) return;
    if (lines.find((l) => l.product_id === p.id)) return toast.error("Produk sudah ada di daftar");
    setLines([...lines, { product_id: p.id, name: p.name, cost: p.cost || 0, qty: 1 }]);
    setPick("");
  };
  const updLine = (id, k, v) => setLines(lines.map((l) => (l.product_id === id ? { ...l, [k]: v } : l)));
  const rmLine = (id) => setLines(lines.filter((l) => l.product_id !== id));

  const savePurchase = async () => {
    if (lines.length === 0) return toast.error("Tambahkan minimal satu produk");
    setBusy(true);
    try {
      await api.post("/purchases", {
        items: lines.map((l) => ({ product_id: l.product_id, name: l.name, cost: Number(l.cost), qty: Number(l.qty) })),
        supplier_id: supplierId === "none" ? null : supplierId,
        outlet_id: outletId === "none" ? null : outletId,
        payment_method: payMethod,
        note,
      });
      toast.success("Pembelian tersimpan & stok bertambah");
      setOpen(false); setLines([]); setSupplierId("none"); setOutletId("none"); setNote(""); setPayMethod("cash");
      qc.invalidateQueries();
    } catch (err) { toast.error(apiError(err.response?.data?.detail)); } finally { setBusy(false); }
  };

  return (
    <div>
      <PageHeader title="Pembelian & Supplier" subtitle="Catat restok barang, stok bertambah & arus kas terhitung otomatis" testid="purchases-header"
        action={<Button onClick={() => setOpen(true)} data-testid="add-purchase-btn"><PackagePlus className="h-4 w-4 mr-2" /> Catat Pembelian</Button>} />

      <Tabs defaultValue="purchases">
        <TabsList className="mb-4">
          <TabsTrigger value="purchases" data-testid="tab-purchases">Riwayat Pembelian</TabsTrigger>
          <TabsTrigger value="suppliers" data-testid="tab-suppliers">Supplier</TabsTrigger>
        </TabsList>

        <TabsContent value="purchases">
          <Card className="rounded-2xl overflow-hidden">
            {isLoading ? <div className="h-48 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> :
              purchases.length === 0 ? <div className="py-16 text-center text-muted-foreground"><Truck className="h-10 w-10 mx-auto mb-3 opacity-50" /> Belum ada pembelian.</div> : (
                <Table>
                  <TableHeader><TableRow><TableHead>Waktu</TableHead><TableHead>Supplier</TableHead><TableHead>Item</TableHead><TableHead>Metode</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {purchases.map((p) => (
                      <TableRow key={p.id} data-testid={`purchase-${p.id}`}>
                        <TableCell className="text-sm whitespace-nowrap">{shortDate(p.created_at)}</TableCell>
                        <TableCell>{p.supplier_name || "-"}</TableCell>
                        <TableCell className="max-w-[240px] truncate">{p.items?.map((i) => `${i.name} x${i.qty}`).join(", ")}</TableCell>
                        <TableCell className="text-sm uppercase">{p.payment_method}{p.is_credit ? " (utang)" : ""}</TableCell>
                        <TableCell className="text-right tabular font-medium text-amber-600">{rupiah(p.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
          </Card>
        </TabsContent>

        <TabsContent value="suppliers">
          <div className="flex justify-end mb-4">
            <Button variant="outline" onClick={() => setSupOpen(true)} data-testid="add-supplier-btn"><Plus className="h-4 w-4 mr-2" /> Tambah Supplier</Button>
          </div>
          {suppliers.length === 0 ? (
            <Card className="rounded-2xl py-16 text-center text-muted-foreground"><Truck className="h-10 w-10 mx-auto mb-3 opacity-50" /> Belum ada supplier.</Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suppliers.map((s) => (
                <Card key={s.id} className="rounded-2xl p-5 flex items-start justify-between" data-testid={`supplier-${s.id}`}>
                  <div>
                    <div className="font-heading font-bold">{s.name}</div>
                    {s.phone && <div className="text-sm text-muted-foreground">{s.phone}</div>}
                    {s.note && <div className="text-xs text-muted-foreground mt-1">{s.note}</div>}
                  </div>
                  <button onClick={async () => { await api.delete(`/suppliers/${s.id}`); qc.invalidateQueries({ queryKey: ["suppliers"] }); }} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Purchase dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Catat Pembelian / Restok</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-2"><Label>Supplier</Label>
                <Select value={supplierId} onValueChange={setSupplierId}>
                  <SelectTrigger data-testid="purchase-supplier"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="none">Tanpa supplier</SelectItem>{suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Outlet</Label>
                <Select value={outletId} onValueChange={setOutletId}>
                  <SelectTrigger data-testid="purchase-outlet"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="none">Umum</SelectItem>{outlets.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Pembayaran</Label>
                <Select value={payMethod} onValueChange={setPayMethod}>
                  <SelectTrigger data-testid="purchase-method"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="cash">Tunai</SelectItem><SelectItem value="qris">QRIS</SelectItem><SelectItem value="credit">Utang</SelectItem></SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-2"><Label>Tambah Produk</Label>
                <Select value={pick} onValueChange={setPick}>
                  <SelectTrigger data-testid="purchase-pick"><SelectValue placeholder="Pilih produk..." /></SelectTrigger>
                  <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button type="button" onClick={addLine} disabled={!pick} data-testid="purchase-add-line"><Plus className="h-4 w-4" /></Button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {lines.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">Belum ada item.</p> :
                lines.map((l) => (
                  <div key={l.product_id} className="flex items-center gap-2 bg-muted/40 rounded-xl p-2">
                    <span className="flex-1 text-sm font-medium truncate">{l.name}</span>
                    <div className="flex items-center gap-1"><span className="text-xs text-muted-foreground">Qty</span><Input type="number" value={l.qty} onChange={(e) => updLine(l.product_id, "qty", e.target.value)} className="h-8 w-16" /></div>
                    <div className="flex items-center gap-1"><span className="text-xs text-muted-foreground">Modal</span><Input type="number" value={l.cost} onChange={(e) => updLine(l.product_id, "cost", e.target.value)} className="h-8 w-24" /></div>
                    <button onClick={() => rmLine(l.product_id)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                  </div>
                ))}
            </div>

            <div className="space-y-2"><Label>Catatan</Label><Input value={note} onChange={(e) => setNote(e.target.value)} /></div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="font-heading font-bold">Total Pembelian</span>
              <span className="font-heading text-2xl font-extrabold text-primary tabular" data-testid="purchase-total">{rupiah(total)}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={savePurchase} disabled={busy || lines.length === 0} data-testid="save-purchase">{busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Simpan Pembelian</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Supplier dialog */}
      <SupplierDialog open={supOpen} onOpenChange={setSupOpen} onSaved={() => qc.invalidateQueries({ queryKey: ["suppliers"] })} />
    </div>
  );
}

function SupplierDialog({ open, onOpenChange, onSaved }) {
  const [form, setForm] = useState({ name: "", phone: "", note: "" });
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try {
      await api.post("/suppliers", form);
      toast.success("Supplier ditambahkan");
      onOpenChange(false); setForm({ name: "", phone: "", note: "" }); onSaved();
    } catch (err) { toast.error(apiError(err.response?.data?.detail)); } finally { setBusy(false); }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Tambah Supplier</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Nama Supplier</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="supplier-name" /></div>
          <div className="space-y-2"><Label>No. HP</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="space-y-2"><Label>Catatan</Label><Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={save} disabled={busy || !form.name} data-testid="save-supplier">{busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
