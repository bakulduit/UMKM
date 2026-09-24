import { useEffect, useState } from "react";
import { api, apiError } from "@/lib/apiClient";
import { rupiah } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import ImageUploader from "@/components/ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, QrCode, Building2 } from "lucide-react";
import { toast } from "sonner";

export default function PlatformSettings() {
  const [form, setForm] = useState({ business_name: "", contact: "", qris_image_path: null });
  const [plans, setPlans] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/settings").then(({ data }) => {
      setForm({ business_name: data.business_name || "", contact: data.contact || "", qris_image_path: data.qris_image_path || null });
      setPlans(data.plans || []);
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setBusy(true);
    try {
      await api.put("/admin/settings", form);
      toast.success("Pengaturan platform tersimpan");
    } catch (err) { toast.error(apiError(err.response?.data?.detail)); } finally { setBusy(false); }
  };

  if (loading) return <div className="h-48 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-2xl">
      <PageHeader title="Pengaturan Platform" subtitle="QRIS pembayaran langganan & informasi platform" testid="platform-settings-header" />

      <Card className="rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 text-secondary"><Building2 className="h-5 w-5" /><h3 className="font-heading font-bold text-lg">Informasi Platform</h3></div>
        <div className="space-y-2"><Label>Nama Platform</Label><Input value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} data-testid="platform-name" /></div>
        <div className="space-y-2"><Label>Kontak (WA/Email)</Label><Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></div>
      </Card>

      <Card className="rounded-2xl p-6 space-y-5 mt-6">
        <div className="flex items-center gap-2 text-secondary"><QrCode className="h-5 w-5" /><h3 className="font-heading font-bold text-lg">QRIS Pembayaran Langganan</h3></div>
        <p className="text-sm text-muted-foreground">QRIS ini akan ditampilkan kepada UMKM saat mereka membayar langganan aplikasi.</p>
        <ImageUploader value={form.qris_image_path} onChange={(p) => setForm({ ...form, qris_image_path: p })} label="Unggah QRIS Platform" testid="platform-qris" />
      </Card>

      <Card className="rounded-2xl p-6 mt-6">
        <h3 className="font-heading font-bold text-lg mb-4">Paket Langganan</h3>
        <div className="space-y-2">
          {plans.map((p) => (
            <div key={p.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
              <span>{p.name} · {p.days} hari</span>
              <span className="tabular font-medium">{rupiah(p.price)}</span>
            </div>
          ))}
        </div>
      </Card>

      <Button className="mt-6" onClick={save} disabled={busy} data-testid="save-platform-settings">{busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Simpan Pengaturan</Button>
    </div>
  );
}
