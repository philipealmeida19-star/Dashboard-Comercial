import { DashboardLayout } from "@/components/DashboardLayout";
import { KPICard } from "@/components/KPICard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { performanceRotas } from "@/lib/data";
import { AlertTriangle, CheckCircle, Download, Filter, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function Performance() {
  const [selectedRota, setSelectedRota] = useState<string>("all");

  const filteredData = selectedRota === "all" 
    ? performanceRotas 
    : performanceRotas.filter(r => r.id === selectedRota);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Performance Comercial</h1>
            <p className="text-muted-foreground mt-1">Acompanhamento detalhado de metas e resultados</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedRota} onValueChange={setSelectedRota}>
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue placeholder="Filtrar por Rota" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Rotas</SelectItem>
                <SelectItem value="norte">Rota Norte</SelectItem>
                <SelectItem value="sul">Rota Sul</SelectItem>
                <SelectItem value="gv1">Rota GV 1</SelectItem>
                <SelectItem value="gv2">Rota GV 2</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
            <Button variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Download className="w-4 h-4 mr-2" /> Exportar
            </Button>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard 
            title="Faturamento Total" 
            value="R$ 556.577" 
            iconName="DollarSign"
            trend="up"
            change={8.4}
            description="Acumulado do mês"
          />
          <KPICard 
            title="Atingimento Meta" 
            value="92%" 
            iconName="Target"
            trend="neutral"
            change={0}
            description="Meta Global: R$ 605k"
          />
          <KPICard 
            title="Unidades Padrão" 
            value="120.300" 
            iconName="Package"
            trend="up"
            change={12.1}
            description="Média: 2.560/promotor"
          />
          <KPICard 
            title="Ticket Médio" 
            value="R$ 4.625" 
            iconName="CreditCard"
            trend="down"
            change={-2.3}
            description="Por ponto de venda"
          />
        </div>

        {/* Detalhe por Rota */}
        <div className="grid gap-6 md:grid-cols-2">
          {filteredData.map((rota) => {
            const atingimento = (rota.faturamento / rota.meta) * 100;
            const isMetaBatida = atingimento >= 100;

            return (
              <Card key={rota.id} className="border-none shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="font-serif text-xl">{rota.nome}</CardTitle>
                      <CardDescription>Supervisor: {rota.supervisor}</CardDescription>
                    </div>
                    <Badge variant={isMetaBatida ? "default" : "secondary"} className={isMetaBatida ? "bg-emerald-600" : ""}>
                      {isMetaBatida ? "Meta Batida" : "Em Andamento"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progresso da Meta</span>
                      <span className="font-bold">{atingimento.toFixed(1)}%</span>
                    </div>
                    <Progress value={atingimento} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>R$ 0</span>
                      <span>Meta: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rota.meta)}</span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-secondary/30 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Faturamento Real</p>
                      <p className="text-lg font-bold font-serif text-primary">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rota.faturamento)}
                      </p>
                    </div>
                    <div className="bg-secondary/30 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Unidades Padrão</p>
                      <p className="text-lg font-bold font-serif text-foreground">
                        {rota.unidadesPadrao.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="bg-secondary/30 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Margem Contrib.</p>
                      <p className="text-lg font-bold font-serif text-emerald-700">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rota.margemContribuicao)}
                      </p>
                    </div>
                    <div className="bg-secondary/30 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Equipe</p>
                      <p className="text-lg font-bold font-serif text-foreground flex items-center gap-2">
                        {rota.vendedores} <span className="text-xs font-sans font-normal text-muted-foreground">vendedores</span>
                      </p>
                    </div>
                  </div>

                  {/* Alerts */}
                  {!isMetaBatida && (
                    <div className="flex items-start gap-3 bg-amber-50 p-3 rounded-lg border border-amber-100">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">Atenção Necessária</p>
                        <p className="text-xs text-amber-700 mt-1">
                          Faltam {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rota.meta - rota.faturamento)} para atingir a meta mensal.
                        </p>
                      </div>
                    </div>
                  )}
                  {isMetaBatida && (
                    <div className="flex items-start gap-3 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-emerald-800">Excelente Resultado</p>
                        <p className="text-xs text-emerald-700 mt-1">
                          Rota superou a meta em {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rota.faturamento - rota.meta)}.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Gráfico de Tendência (Mock) */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Tendência de Faturamento (Últimos 6 Meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { mes: 'Ago', valor: 480000 },
                  { mes: 'Set', valor: 510000 },
                  { mes: 'Out', valor: 495000 },
                  { mes: 'Nov', valor: 530000 },
                  { mes: 'Dez', valor: 580000 },
                  { mes: 'Jan', valor: 556577 },
                ]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="mes" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `R$ ${value/1000}k`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <Tooltip 
                    formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="valor" stroke="var(--primary)" fillOpacity={1} fill="url(#colorValor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
