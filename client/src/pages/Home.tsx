import { DashboardLayout } from "@/components/DashboardLayout";
import { KPICard } from "@/components/KPICard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { kpisGerais, vendasPorProduto } from "@/lib/data";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export default function Home() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative rounded-2xl overflow-hidden h-48 md:h-64 shadow-lg group">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/20 z-10" />
          <img 
            src="/images/hero-pizza-making.jpg" 
            alt="Produção Artesanal" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="relative z-20 h-full flex flex-col justify-center px-8 md:px-12">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
              Visão Geral Executiva
            </h1>
            <p className="text-white/80 max-w-xl text-sm md:text-base font-light">
              Acompanhamento estratégico dos indicadores de performance da Massas Preferenza.
              Foco na meta de R$ 35M para 2026.
            </p>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpisGerais.map((kpi) => (
            <KPICard
              key={kpi.id}
              title={kpi.label}
              value={kpi.value}
              iconName={kpi.icon}
              trend={kpi.trend}
              change={kpi.change}
              description={kpi.description}
            />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Sales Distribution */}
          <Card className="col-span-3 border-none shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif">Mix de Produtos</CardTitle>
              <CardDescription>Distribuição de faturamento (2024)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={vendasPorProduto}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {vendasPorProduto.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Strategic Goals */}
          <Card className="col-span-4 border-none shadow-sm bg-primary text-primary-foreground overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('/images/dashboard-bg-texture.jpg')] opacity-10 mix-blend-overlay" />
            <CardHeader className="relative z-10">
              <CardTitle className="font-serif text-2xl text-white">Objetivo 2026</CardTitle>
              <CardDescription className="text-white/70">Crescimento Acelerado</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 space-y-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm font-medium text-white/60 mb-1">Meta de Faturamento</p>
                  <p className="text-4xl font-bold font-serif">R$ 35.000.000</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white/60 mb-1">Progresso Atual</p>
                  <p className="text-2xl font-bold">51%</p>
                </div>
              </div>
              
              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                <div className="bg-white h-full rounded-full" style={{ width: '51%' }} />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Capacidade Pizza</p>
                  <p className="text-xl font-bold">65 TN/mês</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Capacidade Pastel</p>
                  <p className="text-xl font-bold">25 TN/mês</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
