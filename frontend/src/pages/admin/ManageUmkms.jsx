import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { shortDate } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Building2, Ban, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ManageUmkms() {
  const qc = useQueryClient();
  const { data: umkms = [], isLoading } = useQuery({ queryKey: ["admin-umkms"], queryFn: async () => (await api.get("/admin/umkms")).data });

  const toggle = async (id) => {
    await api.post(`/admin/umkms/${id}/toggle`);
    toast.success("Status UMKM diperbarui");
    qc.invalidateQueries({ queryKey: ["admin-umkms"] });
  };

  const statusBadge = (u) => {
    if (u.suspended) return <Badge variant="destructive">Ditangguhkan</Badge>;
    const s = u.subscription?.status;
    if (s === "trial") return <Badge variant="outline">Uji Coba</Badge>;
    if (s === "active") return <Badge>Aktif</Badge>;
    return <Badge variant="destructive">Berakhir</Badge>;
  };

  return (
    <div>
      <PageHeader title="Kelola UMKM" subtitle="Seluruh UMKM terdaftar di platform" testid="manage-umkm-header" />
      <Card className="rounded-2xl overflow-hidden">
        {isLoading ? <div className="h-64 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> :
          umkms.length === 0 ? <div className="py-16 text-center text-muted-foreground"><Building2 className="h-10 w-10 mx-auto mb-3 opacity-50" /> Belum ada UMKM terdaftar.</div> : (
            <Table>
              <TableHeader><TableRow><TableHead>Nama Usaha</TableHead><TableHead>Pemilik</TableHead><TableHead>Status</TableHead><TableHead>Berlaku Hingga</TableHead><TableHead>Akun</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
              <TableBody>
                {umkms.map((u) => (
                  <TableRow key={u.id} data-testid={`umkm-row-${u.id}`}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-sm">{u.owner_email}</TableCell>
                    <TableCell>{statusBadge(u)}</TableCell>
                    <TableCell className="text-sm">{u.subscription?.subscription_end ? shortDate(u.subscription.subscription_end) : "-"}</TableCell>
                    <TableCell className="text-sm">{u.user_count}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant={u.suspended ? "outline" : "ghost"} onClick={() => toggle(u.id)} data-testid={`toggle-${u.id}`}>
                        {u.suspended ? <><CheckCircle className="h-4 w-4 mr-1" /> Aktifkan</> : <><Ban className="h-4 w-4 mr-1 text-destructive" /> Tangguhkan</>}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
      </Card>
    </div>
  );
}
