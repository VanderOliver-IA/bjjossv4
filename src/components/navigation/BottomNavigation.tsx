import { Link, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { useAuth } from "@/contexts/DevAuthContext";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import {
  DASHBOARD_ITEM,
  getAllNavItemsForRole,
  getPrimaryActionItem,
  type AppNavItem,
} from "@/config/bottomNav";
import { useBottomNavConfig } from "@/hooks/useBottomNavConfig";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const BottomNavigation = () => {
  const { profile, role, isLoading, hasModuleAccess } = useAuth();
  const location = useLocation();

  const { config } = useBottomNavConfig({ userId: profile?.id, role });

  const allItems = useMemo(() => getAllNavItemsForRole(role), [role]);

  const allowedItems = useMemo(() => {
    return allItems.filter((item) => {
      if (!item.module) return true;
      return hasModuleAccess(item.module);
    });
  }, [allItems, hasModuleAccess]);

  const primaryAction = useMemo(() => {
    const candidate = getPrimaryActionItem(role);
    if (!candidate.module) return candidate;
    if (hasModuleAccess(candidate.module)) return candidate;
    return DASHBOARD_ITEM;
  }, [role, hasModuleAccess]);

  if (!profile) return null;

  const resolveItemByPath = (path: string | null | undefined): AppNavItem | null => {
    if (!path) return null;
    const found = allowedItems.find((i) => i.path === path);
    return found ?? null;
  };

  // Quick access: 2 slots configuráveis
  const leftQuick = resolveItemByPath(config.leftPath);
  const rightQuick = resolveItemByPath(config.rightPath);

  // Dedup: evita repetir Dashboard/ação central
  const safeLeftQuick =
    leftQuick && leftQuick.path !== DASHBOARD_ITEM.path && leftQuick.path !== primaryAction.path
      ? leftQuick
      : null;

  const safeRightQuick =
    rightQuick &&
    rightQuick.path !== DASHBOARD_ITEM.path &&
    rightQuick.path !== primaryAction.path &&
    rightQuick.path !== safeLeftQuick?.path
      ? rightQuick
      : null;

  // Fallbacks rápidos (se o usuário configurou algo inválido / sem permissão)
  const fallbackQuickItems = allowedItems.filter(
    (i) => i.path !== DASHBOARD_ITEM.path && i.path !== primaryAction.path,
  );

  const effectiveLeft = safeLeftQuick ?? fallbackQuickItems[0] ?? null;
  const effectiveRight = safeRightQuick ?? fallbackQuickItems[1] ?? fallbackQuickItems[0] ?? null;

  const bottomItems: Array<{ kind: "link"; item: AppNavItem } | { kind: "primary"; item: AppNavItem } | { kind: "menu" }> =
    [
      { kind: "link" as const, item: DASHBOARD_ITEM },
      ...(effectiveLeft ? [{ kind: "link" as const, item: effectiveLeft }] : []),
      { kind: "primary" as const, item: primaryAction },
      ...(effectiveRight ? [{ kind: "link" as const, item: effectiveRight }] : []),
      { kind: "menu" as const },
    ].slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card">
      <div className="max-w-screen-xl mx-auto px-2">
        <div className="flex items-end justify-between h-20 relative">
          {bottomItems.map((entry, idx) => {
            if (entry.kind === "menu") {
              return (
                <MenuSheet
                  key={`menu-${idx}`}
                  items={allowedItems}
                  isLoading={isLoading}
                  activePath={location.pathname}
                />
              );
            }

            const isPrimary = entry.kind === "primary";
            return (
              <BottomNavLink
                key={entry.item.path}
                item={entry.item}
                isActive={location.pathname === entry.item.path}
                isPrimary={isPrimary}
              />
            );
          })}
        </div>
      </div>
    </nav>
  );
};

function BottomNavLink({
  item,
  isActive,
  isPrimary,
}: {
  item: AppNavItem;
  isActive: boolean;
  isPrimary?: boolean;
}) {
  const Icon = item.icon;

  if (isPrimary) {
    return (
      <Link to={item.path} className="flex-1 flex justify-center -translate-y-3">
        <div
          className={cn(
            "btn-presence w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95",
            isActive && "ring-2 ring-ring ring-offset-2 ring-offset-background",
          )}
          aria-label={item.label}
        >
          <Icon className="h-6 w-6 text-primary-foreground" />
          <span className="text-[10px] text-primary-foreground font-medium mt-0.5">{item.label}</span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={item.path}
      className={cn(
        "flex-1 h-full flex flex-col items-center justify-center gap-1 rounded-lg transition-all active:scale-95",
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
      )}
      aria-label={item.label}
    >
      <Icon className={cn("h-6 w-6", isActive && "text-primary")} />
      <span className={cn("text-[11px]", isActive ? "font-medium text-primary" : "text-muted-foreground")}>
        {item.label}
      </span>
    </Link>
  );
}

function MenuSheet({
  items,
  activePath,
  isLoading,
}: {
  items: AppNavItem[];
  activePath: string;
  isLoading: boolean;
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, AppNavItem[]>();
    items.forEach((item) => {
      const group = item.group ?? "Outros";
      map.set(group, [...(map.get(group) ?? []), item]);
    });
    return Array.from(map.entries());
  }, [items]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex-1 h-full flex flex-col items-center justify-center gap-1 rounded-lg text-muted-foreground hover:text-foreground transition-all active:scale-95",
          )}
          aria-label="Menu"
        >
          <Menu className="h-6 w-6" />
          <span className="text-[11px]">Menu</span>
        </button>
      </SheetTrigger>

      <SheetContent side="bottom" className="rounded-t-2xl p-4">
        <SheetHeader className="text-left">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          ) : (
            grouped.map(([group, groupItems]) => (
              <section key={group} className="space-y-2">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{group}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {groupItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePath === item.path;
                    return (
                      <SheetClose key={item.path} asChild>
                        <Link
                          to={item.path}
                          className={cn(
                            "flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors",
                            isActive ? "text-primary" : "text-foreground hover:bg-accent",
                          )}
                        >
                          <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      </SheetClose>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default BottomNavigation;
