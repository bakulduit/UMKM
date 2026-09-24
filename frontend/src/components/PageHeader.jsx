export function PageHeader({ title, subtitle, action, testid }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8" data-testid={testid}>
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-secondary">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
