import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function OutletSelect({ value, onChange, includeAll = true, allLabel = "Semua Outlet", className, testid = "outlet-select" }) {
  const { data: outlets = [] } = useQuery({ queryKey: ["outlets"], queryFn: async () => (await api.get("/outlets")).data });
  return (
    <Select value={value || (includeAll ? "all" : "")} onValueChange={onChange}>
      <SelectTrigger className={className} data-testid={testid}>
        <SelectValue placeholder={allLabel} />
      </SelectTrigger>
      <SelectContent>
        {includeAll && <SelectItem value="all">{allLabel}</SelectItem>}
        {outlets.map((o) => (
          <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
