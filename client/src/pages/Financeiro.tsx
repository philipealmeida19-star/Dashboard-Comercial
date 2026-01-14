import { DashboardLayout } from "@/components/DashboardLayout";
import { KPICard } from "@/components/KPICard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { funilVendas, metasAndamento } from "@/lib/data";
import { BarChart3, DollarSign, PieChart as PieChartIcon, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function Financeiro() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Análise Financeira</h1>
            <p className="text-muted-foreground mt-1">Metas, produtividade e funil de vendas</p>
          </div>
        </div>

        <Tabs defaultValue="metas" className="space-y-6">
          <TabsList className="bg-secondary/50 p-1">
            <TabsTrigger value="metas" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Metas & Realizado</TabsTrigger>
            <TabsTrigger value="funil" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Funil de Vendas</TabsTrigger>
            <TabsTrigger value="produtividade" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Produtividade</TabsTrigger>
          </TabsList>

          {/* Aba de Metas */}
          <TabsContent value="metas" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <KPICard 
                title="Meta Anual" 
                value="R$ 21.5M" 
                iconName="Target"
                description="Projeção 2025"
              />
              <KPICard 
                title="Realizado YTD" 
                value="R$ 17.9M" 
                iconName="DollarSign"
                trend="up"
                change={12.5}
                description="vs. Ano Anterior"
              />
              <KPICard 
                title="Gap para Meta" 
                value="R$ 3.6M" 
                iconName="TrendingUp"
                trend="neutral"
                description="Necessário: R$ 1.2M/mês"
              />
            </div>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif">Evolução Mensal: Meta vs. Realizado</CardTitle>
                <CardDescription>Acompanhamento percentual de atingimento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metasAndamento} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="mes" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} domain={[0, 120]} tickFormatter={(value) => `${value}%`} />
                      <Tooltip 
                        formatter={(value: number) => `${value}%`}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="realizado" name="Realizado (%)" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: "var(--primary)" }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="meta" name="Meta (100%)" stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Funil */}
          <TabsContent value="funil" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="font-serif">Funil de Negociações</CardTitle>
                  <CardDescription>Volume de oportunidades por estágio</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={funilVendas} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                        <XAxis type="number" axisLine={false} tickLine={false} />
                        <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} width={100} />
                        <Tooltip 
                          cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="value" name="Oportunidades" radius={[0, 4, 4, 0]}>
                          {funilVendas.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <KPICard 
                  title="Taxa de Conversão" 
                  value="26.5%" 
                  iconName="PieChart"
                  trend="up"
                  change={2.1}
                  description="Proposta -> Fechamento"
                />
                <KPICard 
                  title="Ciclo Médio de Venda" 
                  value="45 dias" 
                  iconName="Clock"
                  trend="down"
                  change={-5}
                  description="Redução de 3 dias vs. mês anterior"
                />
                <Card className="bg-primary text-primary-foreground border-none shadow-md relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('/images/dashboard-bg-texture.jpg')] opacity-10 mix-blend-overlay" />
                  <CardHeader>
                    <CardTitle className="font-serif text-white">Oportunidades Quentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 relative z-10">
                      <div className="flex justify-between items-center border-b border-white/20 pb-2">
                        <span>Rede Supermarket (RJ)</span>
                        <span className="font-bold">R$ 120k</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/20 pb-2">
                        <span>Grupo Mateus (BA)</span>
                        <span className="font-bold">R$ 85k</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/20 pb-2">
                        <span>Assaí Atacadista (SP)</span>
                        <span className="font-bold">R$ 210k</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Aba de Produtividade */}
          <TabsContent value="produtividade" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <KPICard 
                title="Unidade Padrão (Média)" 
                value="2.150" 
                iconName="Package"
                trend="down"
                change={-6.5}
                description="Meta: 2.300 UP"
              />
              <KPICard 
                title="Capacidade Ociosa Pizza" 
                value="12%" 
                iconName="Activity"
                trend="neutral"
                description="Produção atual: 57 TN"
              />
              <KPICard 
                title="Capacidade Ociosa Pastel" 
                value="35%" 
                iconName="Activity"
                trend="down"
                description="Produção atual: 16 TN"
              />
              <KPICard 
                title="Custo por UP" 
                value="R$ 0,32" 
                iconName="DollarSign"
                trend="up"
                change={1.5}
                description="Leve aumento vs. mês anterior"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="font-serif">Mix de Produção (Peso)</CardTitle>
                  <CardDescription>Distribuição em KG (Out/2025)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Pizza', value: 386370, fill: 'var(--chart-1)' },
                            { name: 'Pastel', value: 167132, fill: 'var(--chart-3)' },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                        </Pie>
                        <Tooltip formatter={(value: number) => `${(value/1000).toFixed(1)} TN`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="font-serif">Produtividade por Região</CardTitle>
                  <CardDescription>Média de UP por Promotor</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { region: 'Sudeste', up: 2450 },
                        { region: 'Sul', up: 2100 },
                        { region: 'Nordeste', up: 1850 },
                      ]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="region" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                        <Bar dataKey="up" name="Unidades Padrão" fill="var(--chart-2)" radius={[4, 4, 0, 0]}>
                          {/* Adicionar linha de meta visualmente se possível, ou usar ReferenceLine */}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
