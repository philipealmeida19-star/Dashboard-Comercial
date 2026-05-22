import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, TrendingUp, Target, Briefcase } from "lucide-react";

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [supervisores, setSupervisores] = useState<string[]>([]);
  const [perfis, setPerfis] = useState<string[]>([]);
  const [orcamento, setOrcamento] = useState<any>(null);
  
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>("all");
  const [selectedPerfil, setSelectedPerfil] = useState<string>("all");
  const [selectedAno, setSelectedAno] = useState<string>("2025");
  const [selectedMes, setSelectedMes] = useState<string>("all");
  const [selectedGrupo, setSelectedGrupo] = useState<string>("all");
  const [visao, setVisao] = useState<string>("vendas"); // "vendas" ou "devolucoes"
  const [anos, setAnos] = useState<string[]>([]);
  const [meses, setMeses] = useState<string[]>([]);
  const [grupos, setGrupos] = useState<string[]>([]);

  useEffect(() => {
    fetch("/data.json")
      .then(res => res.json())
      .then(jsonData => {
        setData(jsonData.lojas || []);
        setFilteredData(jsonData.lojas || []);
        setOrcamento(jsonData.orcamento_2026 || null);
        
        const uniqueSupervisores = Array.from(new Set((jsonData.lojas || []).map((item: any) => item.Supervisor))).filter(Boolean).sort() as string[];
        const uniquePerfis = Array.from(new Set((jsonData.lojas || []).map((item: any) => item.Perfil))).filter(Boolean).sort() as string[];
        const uniqueAnos = Array.from(new Set((jsonData.lojas || []).map((item: any) => String(item.Ano)))).filter(Boolean).sort() as string[];
        const uniqueMeses = Array.from(new Set((jsonData.lojas || []).map((item: any) => String(item.Mes)))).filter(Boolean).sort((a, b) => Number(a) - Number(b)) as string[];
        const uniqueGrupos = Array.from(new Set((jsonData.lojas || []).map((item: any) => item.Grupo_do_Produto))).filter(Boolean).sort() as string[];
        
        setSupervisores(uniqueSupervisores);
        setPerfis(uniquePerfis);
        setAnos(uniqueAnos);
        setMeses(uniqueMeses);
        setGrupos(uniqueGrupos);
      });
  }, []);

  useEffect(() => {
    let result = data;
    if (selectedSupervisor !== "all") {
      result = result.filter(item => item.Supervisor === selectedSupervisor);
    }
    if (selectedPerfil !== "all") {
      result = result.filter(item => item.Perfil === selectedPerfil);
    }
    if (selectedAno !== "all") {
      result = result.filter(item => String(item.Ano) === selectedAno);
    }
    if (selectedMes !== "all") {
      result = result.filter(item => String(item.Mes) === selectedMes);
    }
    if (selectedGrupo !== "all") {
      result = result.filter(item => item.Grupo_do_Produto === selectedGrupo);
    }
    setFilteredData(result);
  }, [selectedSupervisor, selectedPerfil, selectedAno, selectedMes, selectedGrupo, data]);

  // Calculate KPIs
  const totalVendaRS = filteredData.reduce((sum, item) => sum + (visao === "vendas" ? (item.Valor_Liquido || 0) : (item.Valor_Devolucao || 0)), 0);
  const totalVendaUP = filteredData.reduce((sum, item) => sum + (visao === "vendas" ? (item.UP_Liquida || 0) : (item.UP_Devolucao || 0)), 0);
  const totalFTE = filteredData.reduce((sum, item) => sum + (item.FTE || 0), 0);
  
  // Produtividade (UP / Pessoas)
  // Dados manuais de pessoas para 2026: Jan=198, Fev=197, Mar=182, Abr=176
  // Maio em diante usa o FTE atual (aprox 184)
  let totalPessoas = 0;
  if (selectedAno === "2026") {
    if (selectedMes === "1") totalPessoas = 198;
    else if (selectedMes === "2") totalPessoas = 197;
    else if (selectedMes === "3") totalPessoas = 182;
    else if (selectedMes === "4") totalPessoas = 176;
    else if (selectedMes === "5") totalPessoas = totalFTE; // Maio usa o FTE
    else if (selectedMes === "all") {
      // Média de pessoas no ano até agora
      totalPessoas = (198 + 197 + 182 + 176 + totalFTE) / 5;
    }
  }
  
  const produtividadeUP = totalPessoas > 0 ? (totalVendaUP / totalPessoas).toFixed(0) : "N/A";
  
  // Orçamento 2026
  let metaTotalRS = 0;
  if (orcamento) {
    if (selectedGrupo === "PIZZA PREFERENZA") {
      metaTotalRS = orcamento.pizza;
    } else if (selectedGrupo === "PASTEL PREFERENZA") {
      metaTotalRS = orcamento.pastel;
    } else {
      metaTotalRS = orcamento.total;
    }
  }
  const atingimentoRS = metaTotalRS > 0 ? ((totalVendaRS / metaTotalRS) * 100).toFixed(1) : "0";

  // Consolidate table data by CNPJ
  const consolidatedTableData = Array.from(
    filteredData.reduce((acc, item) => {
      const key = item.CNPJ_clean || item.Cliente;
      if (!acc.has(key)) {
        acc.set(key, {
          Cliente: item.Cliente,
          Supervisor: item.Supervisor,
          Grupo_do_Produto: selectedGrupo !== "all" ? item.Grupo_do_Produto : "Múltiplos",
          Valor_Liquido: 0,
          UP_Liquida: 0,
          Valor_Devolucao: 0,
          UP_Devolucao: 0,
          FTE: item.FTE || 0 // FTE is per CNPJ, so we just take it once
        });
      }
      const row = acc.get(key);
      row.Valor_Liquido += (item.Valor_Liquido || 0);
      row.UP_Liquida += (item.UP_Liquida || 0);
      row.Valor_Devolucao += (item.Valor_Devolucao || 0);
      row.UP_Devolucao += (item.UP_Devolucao || 0);
      
      // If filtering by a specific product, show it. Otherwise, if a client has multiple products, show "Múltiplos"
      if (selectedGrupo === "all" && row.Grupo_do_Produto !== "Múltiplos" && row.Grupo_do_Produto !== item.Grupo_do_Produto) {
        row.Grupo_do_Produto = "Múltiplos";
      } else if (selectedGrupo === "all" && row.Grupo_do_Produto === "Múltiplos" && acc.get(key)._firstProduct === undefined) {
         acc.get(key)._firstProduct = item.Grupo_do_Produto;
         row.Grupo_do_Produto = item.Grupo_do_Produto;
      } else if (selectedGrupo === "all" && row.Grupo_do_Produto !== "Múltiplos" && acc.get(key)._firstProduct !== item.Grupo_do_Produto) {
         row.Grupo_do_Produto = "Múltiplos";
      }

      return acc;
    }, new Map()).values()
  ).sort((a: any, b: any) => {
    const valA = visao === "vendas" ? a.Valor_Liquido : a.Valor_Devolucao;
    const valB = visao === "vendas" ? b.Valor_Liquido : b.Valor_Devolucao;
    return valB - valA;
  });

  // Prepare chart data
  const topSupervisores = Array.from(
    filteredData.reduce((acc, item) => {
      const sup = item.Supervisor || "Sem Supervisor";
      const val = visao === "vendas" ? (item.Valor_Liquido || 0) : (item.Valor_Devolucao || 0);
      acc.set(sup, (acc.get(sup) || 0) + val);
      return acc;
    }, new Map())
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);

  const topPerfis = Array.from(
    filteredData.reduce((acc, item) => {
      const perfil = item.Perfil || "Sem Perfil";
      const val = visao === "vendas" ? (item.Valor_Liquido || 0) : (item.Valor_Devolucao || 0);
      acc.set(perfil, (acc.get(perfil) || 0) + val);
      return acc;
    }, new Map())
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);

  // Preferenza Brand Colors: Green (#1A7B3E), Yellow (#F2C010), Red (#C1272D)
  const COLORS = ['#1A7B3E', '#F2C010', '#C1272D', '#2E8B57', '#E6A800'];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border-t-4 border-t-[#1A7B3E]">
          <div className="flex items-center gap-4">
            <img src="/manus-storage/Logo_64c854cf.jpg" alt="Preferenza Logo" className="h-16 object-contain" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Dashboard Preferenza</h1>
              <p className="text-slate-500 mt-1">Visão Integrada: Vendas, Metas e Força de Trabalho</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 w-full md:w-auto justify-end">
            <Select value={visao} onValueChange={setVisao}>
              <SelectTrigger className="w-[150px] bg-slate-100 font-semibold">
                <SelectValue placeholder="Visão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vendas">Vendas Líquidas</SelectItem>
                <SelectItem value="devolucoes">Devoluções</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedAno} onValueChange={setSelectedAno}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Anos</SelectItem>
                {anos.map(ano => (
                  <SelectItem key={ano} value={ano}>{ano}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMes} onValueChange={setSelectedMes}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Meses</SelectItem>
                {meses.map(mes => (
                  <SelectItem key={mes} value={mes}>{`Mês ${mes}`}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedGrupo} onValueChange={setSelectedGrupo}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Grupo de Produto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Produtos</SelectItem>
                {grupos.map(grupo => (
                  <SelectItem key={grupo} value={grupo}>{grupo}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSupervisor} onValueChange={setSelectedSupervisor}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Supervisor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Supervisores</SelectItem>
                {supervisores.map(sup => (
                  <SelectItem key={sup} value={sup}>{sup}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPerfil} onValueChange={setSelectedPerfil}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Perfis</SelectItem>
                {perfis.map(perfil => (
                  <SelectItem key={perfil} value={perfil}>{perfil}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-[#1A7B3E] cursor-pointer hover:shadow-md transition-shadow" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{visao === "vendas" ? "Venda Líquida (R$)" : "Devoluções (R$)"}</CardTitle>
              <TrendingUp className="h-4 w-4 text-[#1A7B3E]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalVendaRS)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {selectedAno === '2026' ? `Atingimento: ${atingimentoRS}% do Orçamento 2026` : 'Comparativo não aplicável (Selecione 2026)'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#F2C010] cursor-pointer hover:shadow-md transition-shadow" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{visao === "vendas" ? "Venda Líquida (UP)" : "Devoluções (UP)"}</CardTitle>
              <Target className="h-4 w-4 text-[#F2C010]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {new Intl.NumberFormat('pt-BR').format(totalVendaUP)} UP
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#C1272D] cursor-pointer hover:shadow-md transition-shadow" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Força de Trabalho (FTE)</CardTitle>
              <Users className="h-4 w-4 text-[#C1272D]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {totalFTE.toFixed(1)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Pessoas Efetivas</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-slate-800 cursor-pointer hover:shadow-md transition-shadow" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Produtividade</CardTitle>
              <Briefcase className="h-4 w-4 text-slate-800" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {produtividadeUP !== "N/A" ? `${new Intl.NumberFormat('pt-BR').format(Number(produtividadeUP))} UP` : "Selecione 2026"}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {selectedAno === "2026" && selectedMes !== "all" ? `Base: ${totalPessoas.toFixed(0)} pessoas` : "UP por pessoa (Média)"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Supervisores ({visao === "vendas" ? "Venda R$" : "Devoluções R$"})</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSupervisores} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={(value) => `R$ ${(value/1000000).toFixed(1)}M`} />
                  <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 12}} />
                  <Tooltip formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)} />
                  <Bar dataKey="value" fill="#1A7B3E" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top 5 Redes/Perfis ({visao === "vendas" ? "Venda R$" : "Devoluções R$"})</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topPerfis}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {topPerfis.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhamento por Loja (CNPJ)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Supervisor</th>
                    <th className="px-4 py-3">Produto</th>
                    <th className="px-4 py-3 text-right">{visao === "vendas" ? "Venda (R$)" : "Devolução (R$)"}</th>
                    <th className="px-4 py-3 text-right">{visao === "vendas" ? "Venda (UP)" : "Devolução (UP)"}</th>
                    <th className="px-4 py-3 text-right">FTE</th>
                    <th className="px-4 py-3 text-right">Produtividade (UP/FTE)</th>
                  </tr>
                </thead>
                <tbody>
                  {consolidatedTableData.slice(0, 10).map((item: any, idx: number) => (
                    <tr key={idx} className="border-b hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900 truncate max-w-[200px]">{item.Cliente}</td>
                      <td className="px-4 py-3 text-slate-600">{item.Supervisor}</td>
                      <td className="px-4 py-3 text-slate-600">{item.Grupo_do_Produto}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(visao === "vendas" ? (item.Valor_Liquido || 0) : (item.Valor_Devolucao || 0))}
                      </td>
                      <td className="px-4 py-3 text-right">{new Intl.NumberFormat('pt-BR').format(visao === "vendas" ? (item.UP_Liquida || 0) : (item.UP_Devolucao || 0))}</td>
                      <td className="px-4 py-3 text-right">{(item.FTE || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-[#1A7B3E] font-medium">
                        {item.FTE > 0 ? ((visao === "vendas" ? (item.UP_Liquida || 0) : (item.UP_Devolucao || 0)) / item.FTE).toFixed(0) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 text-center text-sm text-slate-500">
                Mostrando as 10 primeiras lojas do filtro atual.
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
