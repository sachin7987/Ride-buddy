import type { LucideIcon } from "lucide-react";

/**
 * Shared hero band for static marketing/info pages (About, Safety, Help, …).
 * Keeps these pages visually consistent with the landing page's gradient hero.
 */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <section className="gradient-hero">
      <div className="container py-14 md:py-20 text-center">
        {eyebrow && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white/70 px-3 py-1 text-xs font-medium text-brand-700 shadow-sm">
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {eyebrow}
          </span>
        )}
        <h1 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
