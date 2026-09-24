import { fileUrl } from "@/lib/apiClient";
import { ImageIcon } from "lucide-react";

export default function AuthImage({ path, alt, className }) {
  if (!path)
    return (
      <div className={`flex items-center justify-center bg-muted text-muted-foreground ${className}`}>
        <ImageIcon className="h-8 w-8" />
      </div>
    );
  return <img src={fileUrl(path)} alt={alt} className={className} />;
}
