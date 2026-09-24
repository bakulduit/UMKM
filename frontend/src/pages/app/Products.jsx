import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiError } from "@/lib/apiClient";
import { rupiah } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import ImageUploader from "@/components/ImageUploader";
import AuthImage from "@/components/AuthImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2, Package } from "lucide-react";
import { toast } from "sonner";

const empty = { name: "", sku: "", category: "Umum", price: 0, cost: 0, stock: 0, low_stock_threshold: 5, image_path: null };

export default function Products() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [busy, setBusy] = useState(false);

  const { data: products = [], isLoading } = useQuery({ queryKey: ["products"], queryFn: async () => (await api.get("/products")).data });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const openNew = () => { setForm(empty); setEditId(null); setOpen(true); };
  const openEdit = (p) => { setForm(p); setEditId(p.id); setOpen(true); };

  const save = async () => {
    setBusy(true);
    try {
      const payload = { ...form, price: Number(form.price), cost: Number(form.cost), stock: Number(form.stock), low_stock_threshold: Number(form.low_stock_threshold) };
      if (editId) await api.put(`/products/${editId}`, payload);
      else await api.post("/products", payload);
      toast.success("Produk tersimpan");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["products"] });
    } catch (err) {
      toast.error(apiError(err.response?.data?.detail));
    } finally { setBusy(false); }
  };

  const del = async (id) => {
    if (!window.confirm("Hapus produk ini?")) return;
    await api.delete(`/products/${id}`);
    qc.invalidateQueries({ queryKey: ["products"] });
    toast.success("Produk dihapus");
  };

  return (
    <div>
      <PageHeader title="Produk" subtitle="Kelola daftar produk & stok" testid="products-header"
        action={<Button onClick={openNew} data-testid="add-product-btn"><Plus className="h-4 w-4 mr-2" /> Tambah Produk</Button>} />

      <Card className="rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="h-64 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground"><Package className="h-10 w-10 mx-auto mb-3 opacity-50" /> Belum ada produk.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead><TableHead>Kategori</TableHead><TableHead>Harga Jual</TableHead>
                <TableHead>Modal</TableHead><TableHead>Stok</TableHead><TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id} data-testid={`product-row-${p.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg overflow-hidden bg-accent shrink-0">
                        {p.image_path ? <AuthImage path={p.image_path} className="h-full w-full object-cover" /> : <div className="h-full w-full grid place-items-center"><Package className="h-4 w-4 text-accent-foreground" /></div>}
                      </div>
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell className="tabular">{rupiah(p.price)}</TableCell>
                  <TableCell className="tabular">{rupiah(p.cost)}</TableCell>
                  <TableCell>
                    <span className={`tabular ${p.stock <= p.low_stock_threshold ? "text-amber-600 font-semibold" : ""}`}>{p.stock}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(p)} data-testid={`edit-${p.id}`}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => del(p.id)} data-testid={`del-${p.id}`}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editId ? "Edit Produk" : "Tambah Produk"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <ImageUploader value={form.image_path} onChange={(p) => setForm({ ...form, image_path: p })} label="Foto Produk" testid="product-image" />
            <div className="space-y-2"><Label>Nama Produk</Label><Input value={form.name} onChange={set("name")} data-testid="product-name" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Kategori</Label><Input value={form.category} onChange={set("category")} data-testid="product-category" /></div>
              <div className="space-y-2"><Label>SKU (opsional)</Label><Input value={form.sku} onChange={set("sku")} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Harga Jual</Label><Input type="number" value={form.price} onChange={set("price")} data-testid="product-price" /></div>
              <div className="space-y-2"><Label>Harga Modal</Label><Input type="number" value={form.cost} onChange={set("cost")} data-testid="product-cost" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Stok</Label><Input type="number" value={form.stock} onChange={set("stock")} data-testid="product-stock" /></div>
              <div className="space-y-2"><Label>Batas Stok Menipis</Label><Input type="number" value={form.low_stock_threshold} onChange={set("low_stock_threshold")} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={save} disabled={busy || !form.name} data-testid="save-product">{busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
