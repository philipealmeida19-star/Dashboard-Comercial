import { cn } from "@/lib/utils";
import { BarChart3, Home, LayoutDashboard, Map, PieChart, Settings, Users, TrendingDown } from "lucide-react";
import { Link, useLocation } from "wouter";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Visão Geral", href: "/" },
    { icon: Users, label: "Supervisão & Rotas", href: "/supervisao" },
    { icon: BarChart3, label: "Performance", href: "/performance" },
    { icon: PieChart, label: "Financeiro", href: "/financeiro" },
    { icon: Map, label: "Geográfico", href: "/mapa" },
    { icon: TrendingDown, label: "Devoluções Criativa", href: "/devolucoes" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border hidden md:flex flex-col fixed h-full z-10 transition-all duration-300">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden">
             <img src="/images/logo-placeholder.png" alt="Preferenza" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-xl text-sidebar-foreground tracking-tight">Preferenza</h1>
            <p className="text-xs text-sidebar-foreground/70 font-sans">Business Intelligence</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group cursor-pointer",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/70")} />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border/20">
          <div className="flex items-center gap-3 px-4 py-3 text-sidebar-foreground/70 hover:text-sidebar-foreground cursor-pointer transition-colors">
            <Settings className="w-5 h-5" />
            <span className="font-medium text-sm">Configurações</span>
          </div>
          <div className="mt-4 px-4">
            <div className="bg-sidebar-accent/30 rounded-lg p-3">
              <p className="text-xs text-sidebar-foreground/60 mb-1">Usuário Logado</p>
              <p className="text-sm font-semibold text-sidebar-foreground">Philipe (Diretor)</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
        <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-20 px-6 flex items-center justify-between">
          <div className="md:hidden">
            {/* Mobile Menu Trigger would go here */}
            <span className="font-serif font-bold text-primary">Preferenza</span>
          </div>
          <div className="hidden md:block">
            <h2 className="text-lg font-medium text-foreground/80">
              {navItems.find(i => i.href === location)?.label || "Dashboard"}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full border border-border/50">
              Atualizado: Jan 2026
            </span>
          </div>
        </header>
        
        <div className="p-6 md:p-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
