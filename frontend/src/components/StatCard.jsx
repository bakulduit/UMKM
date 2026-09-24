export default function StatCard({ icon: Icon, label, value, sub, tone = "default", testid }) {
  const tones = {
    default: "bg-white",
    primary: "bg-primary text-white",
    dark: "bg-secondary text-white",
  };
  const iconTone = tone === "default" ? "bg-accent text-accent-foreground" : "bg-white/15 text-white";
  return (
    <div className={`rounded-2xl border p-6 ${tones[tone]}`} data-testid={testid}>
      <div className="flex items-center justify-between">
        <span className={`overline ${tone === "default" ? "text-muted-foreground" : "text-white/70"}`}>{label}</span>
        {Icon && <span className={`h-9 w-9 rounded-xl grid place-items-center ${iconTone}`}><Icon className="h-[18px] w-[18px]" /></span>}
      </div>
      <div className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight mt-3 tabular">{value}</div>
      {sub && <div className={`text-xs mt-1 ${tone === "default" ? "text-muted-foreground" : "text-white/60"}`}>{sub}</div>}
    </div>
  );
}
