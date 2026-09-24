import { useRef, useState } from "react";
import { api } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import AuthImage from "@/components/AuthImage";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ImageUploader({ value, onChange, label = "Unggah Gambar", testid = "image-uploader" }) {
  const inputRef = useRef();
  const [busy, setBusy] = useState(false);

  const handle = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      onChange(data.path);
      toast.success("Gambar terunggah");
    } catch (err) {
      toast.error("Gagal mengunggah gambar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="h-24 w-24 rounded-xl overflow-hidden border bg-muted shrink-0">
        <AuthImage path={value} alt="preview" className="h-full w-full object-cover" />
      </div>
      <div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handle} data-testid={`${testid}-input`} />
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={busy} data-testid={`${testid}-btn`}>
          {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
          {label}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">PNG / JPG, maksimal beberapa MB.</p>
      </div>
    </div>
  );
}
