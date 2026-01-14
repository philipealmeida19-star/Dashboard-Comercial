import { DashboardLayout } from "@/components/DashboardLayout";
import { KPICard } from "@/components/KPICard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cenariosSupervisao, performanceRotas } from "@/lib/data";
import { ArrowRight, CheckCircle2, Users, Wallet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function Supervisao() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Análise de Supervisão</h1>
            <p className="text-muted-foreground mt-1">Comparativo de cenários e performance por rota</p>
          </div>
          <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg">
            <Badge variant="outline" className="bg-background text-muted-foreground border-none shadow-sm">Cenário 1 (Atual)</Badge>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">Cenário 2 (Proposto)</Badge>
          </div>
        </div>

        {/* Comparativo de Cenários */}
        <div className="grid gap-6 md:grid-cols-2">
          {cenariosSupervisao.map((cenario, index) => (
            <Card key={index} className={`border-none shadow-md overflow-hidden ${index === 1 ? 'ring-2 ring-primary/20' : ''}`}>
              <CardHeader className={`${index === 1 ? 'bg-primary/5' : 'bg-secondary/30'} pb-4`}>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="font-serif text-xl">{cenario.name}</CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-2">
                      <Users className="w-4 h-4" /> {cenario.supervisores} Supervisores
                    </CardDescription>
                  </div>
                  {index === 1 && <Badge className="bg-emerald-600 hover:bg-emerald-700">Recomendado</Badge>}
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Custo Total</p>
                    <p className="text-2xl font-bold font-serif text-foreground">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cenario.custoTotal)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Margem Contrib.</p>
                    <p className="text-2xl font-bold font-serif text-emerald-700">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cenario.margemContribuicao)}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Custo sobre Faturamento</span>
                    <span className={`font-semibold ${cenario.percentualCusto > 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {cenario.percentualCusto.toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${cenario.percentualCusto > 5 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${cenario.percentualCusto * 10}%` }} 
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-border">
                    <span className="text-muted-foreground">Pessoas por Supervisor</span>
                    <span className="font-semibold">{cenario.mediaPessoasPorSup.toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detalhamento por Rota (Cenário 2) */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif">Performance Projetada por Rota (Cenário 2)</CardTitle>
            <CardDescription>Análise detalhada das 4 rotas propostas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader className="bg-secondary/30">
                  <TableRow>
                    <TableHead className="font-semibold">Rota</TableHead>
                    <TableHead className="text-right font-semibold">Vendedores</TableHead>
                    <TableHead className="text-right font-semibold">Faturamento</TableHead>
                    <TableHead className="text-right font-semibold">Meta</TableHead>
                    <TableHead className="text-right font-semibold">Custo Total</TableHead>
                    <TableHead className="text-right font-semibold">% Custo</TableHead>
                    <TableHead className="text-center font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performanceRotas.map((rota) => (
                    <TableRow key={rota.id} className="hover:bg-secondary/10 transition-colors">
                      <TableCell className="font-medium">{rota.nome}</TableCell>
                      <TableCell className="text-right">{rota.vendedores}</TableCell>
                      <TableCell className="text-right font-mono">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rota.faturamento)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rota.meta)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-rose-600">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rota.custoTotal)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className={
                          rota.percentualCusto > 8 ? "text-rose-600 border-rose-200 bg-rose-50" : 
                          rota.percentualCusto > 5 ? "text-amber-600 border-amber-200 bg-amber-50" : 
                          "text-emerald-600 border-emerald-200 bg-emerald-50"
                        }>
                          {rota.percentualCusto.toFixed(2)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {rota.faturamento >= rota.meta ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-amber-400 mx-auto" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico Comparativo */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="col-span-3 md:col-span-2 border-none shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif">Faturamento vs. Meta por Rota</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceRotas} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="nome" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `R$ ${value/1000}k`} />
                    <Tooltip 
                      formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                      cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend />
                    <Bar dataKey="faturamento" name="Faturamento Real" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="meta" name="Meta Estipulada" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-sidebar text-sidebar-foreground">
            <CardHeader>
              <CardTitle className="font-serif text-white flex items-center gap-2">
                <Wallet className="w-5 h-5" /> Impacto Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm text-white/70 mb-1">Investimento Adicional</p>
                <p className="text-3xl font-bold text-white">R$ 7.864,62</p>
                <p className="text-xs text-white/50">Mensal (Supervisor + Veículo)</p>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <p className="text-sm text-white/70 mb-1">Redução de Carga</p>
                <p className="text-3xl font-bold text-white">-25%</p>
                <p className="text-xs text-white/50">Promotores por Supervisor</p>
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-sm text-white/70 mb-2">Conclusão</p>
                <p className="text-sm leading-relaxed text-white/90">
                  O aumento de custo é justificado pela melhoria na qualidade da gestão e potencial de aumento de vendas através de acompanhamento mais próximo.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
