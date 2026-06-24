import { useState, useEffect, useRef, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import {
  TrendingDown,
  Store,
  Users,
  AlertTriangle,
  DollarSign,
  Download,
  FileText,
  RefreshCw,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// ─── Constantes ────────────────────────────────────────────────────────────────
const META_PCT = 3;

const COR_OK = "#16a34a";
const COR_ATENCAO = "#f59e0b";
const COR_CRITICO = "#ab1008";
const COR_META = "#3b82f6";
const COR_PRINCIPAL = "#e95959";
const COR_FUNDO = "#f4dbdb";

// ─── Tipos ─────────────────────────────────────────────────────────────────────
interface Registro {
  mes: string;
  mes_num: number;
  ano: number;
  loja: number;
  loja_original: number;
  nome_loja: string;
  municipio: string;
  endereco: string;
  promotor: string;
  regiao: string;
  dias_visita: string[];
  valor_total: number;
  valor_devolvido: number;
  pct_devolucao: number;
}

interface DadosDevolucoes {
  registros: Registro[];
  promotores: { promotor: string; regiao: string; lojas: number[] }[];
  meses: { Mes_str: string; Mes_num: number; Ano: number }[];
  ultima_atualizacao: string;
}

// ─── Utilitários ───────────────────────────────────────────────────────────────
function getStatus(pct: number): "ok" | "atencao" | "critico" {
  if (pct <= META_PCT) return "ok";
  if (pct <= 10) return "atencao";
  return "critico";
}

function corStatus(pct: number): string {
  const s = getStatus(pct);
  if (s === "ok") return COR_OK;
  if (s === "atencao") return COR_ATENCAO;
  return COR_CRITICO;
}

function labelStatus(pct: number): string {
  const s = getStatus(pct);
  if (s === "ok") return "OK";
  if (s === "atencao") return "Atenção";
  return "Crítico";
}

function fmtBRL(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtPct(v: number): string {
  return v.toFixed(1) + "%";
}

// ─── Exportações ───────────────────────────────────────────────────────────────
async function exportarPDF(
  ref: React.RefObject<HTMLDivElement | null>,
  nomeArquivo: string,
  escala = 2
) {
  if (!ref.current) return;
  const canvas = await html2canvas(ref.current, {
    scale: escala,
    useCORS: true,
    backgroundColor: "#ffffff",
  });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? "landscape" : "portrait",
    unit: "px",
    format: [canvas.width / escala, canvas.height / escala],
  });
  pdf.addImage(imgData, "PNG", 0, 0, canvas.width / escala, canvas.height / escala);
  pdf.save(nomeArquivo);
}

function exportarCSV(
  linhas: Record<string, string | number>[],
  nomeArquivo: string
) {
  if (!linhas.length) return;
  const cabecalho = Object.keys(linhas[0]).join(";");
  const corpo = linhas
    .map((l) => Object.values(l).join(";"))
    .join("\n");
  const bom = "\uFEFF";
  const blob = new Blob([bom + cabecalho + "\n" + corpo], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Componente Principal ──────────────────────────────────────────────────────
export default function Devolucoes() {
  const [dados, setDados] = useState<DadosDevolucoes | null>(null);
  const [selectedMes, setSelectedMes] = useState<string>("all");
  const [selectedPromotor, setSelectedPromotor] = useState<string>("all");
  const [tendenciaMesInicio, setTendenciaMesInicio] = useState<string>("all");
  const [tendenciaMesFim, setTendenciaMesFim] = useState<string>("all");
  const [ordenacaoTabela, setOrdenacaoTabela] = useState<"pct" | "valor">("pct");
  const [isExporting, setIsExporting] = useState(false);

  const dashboardRef = useRef<HTMLDivElement>(null);
  const kpiRef = useRef<HTMLDivElement>(null);
  const graficoEvolucaoRef = useRef<HTMLDivElement>(null);
  const graficoPromotorRef = useRef<HTMLDivElement>(null);
  const graficoTendenciaRef = useRef<HTMLDivElement>(null);
  const tabelaPromotorRef = useRef<HTMLDivElement>(null);
  const tabelaLojaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/devolucoes_data.json")
      .then((r) => r.json())
      .then((d: DadosDevolucoes) => setDados(d))
      .catch(() => console.error("Erro ao carregar devolucoes_data.json"));
  }, []);

  // ─── Dados filtrados ──────────────────────────────────────────────────────
  const registrosFiltrados = (dados?.registros ?? []).filter((r) => {
    if (selectedMes !== "all" && r.mes !== selectedMes) return false;
    if (selectedPromotor !== "all" && r.promotor !== selectedPromotor) return false;
    return true;
  });

  // ─── KPIs ─────────────────────────────────────────────────────────────────
  const totalDevolvido = registrosFiltrados.reduce(
    (s, r) => s + r.valor_devolvido,
    0
  );
  const totalVendas = registrosFiltrados.reduce(
    (s, r) => s + r.valor_total,
    0
  );
  const pctGeralDevolucao =
    totalVendas > 0 ? (totalDevolvido / totalVendas) * 100 : 0;
  const lojasMonitoradas = new Set(registrosFiltrados.map((r) => r.loja)).size;
  const promotoresAtivos = new Set(
    registrosFiltrados.map((r) => r.promotor)
  ).size;

  // Lojas acima da meta: agrupa por loja e calcula pct consolidado
  const pctPorLoja = Object.values(
    registrosFiltrados.reduce<
      Record<number, { total: number; devolvido: number }>
    >((acc, r) => {
      if (!acc[r.loja]) acc[r.loja] = { total: 0, devolvido: 0 };
      acc[r.loja].total += r.valor_total;
      acc[r.loja].devolvido += r.valor_devolvido;
      return acc;
    }, {})
  ).map((v) => (v.total > 0 ? (v.devolvido / v.total) * 100 : 0));
  const lojasAcimaMeta = pctPorLoja.filter((p) => p > META_PCT).length;

  // ─── Gráfico 1: Evolução Mensal ───────────────────────────────────────────
  const evolucaoMensal = (dados?.meses ?? [])
    .filter((m) => {
      if (selectedPromotor === "all") return true;
      return dados?.registros.some(
        (r) => r.mes === m.Mes_str && r.promotor === selectedPromotor
      );
    })
    .map((m) => {
      const regs = (dados?.registros ?? []).filter(
        (r) =>
          r.mes === m.Mes_str &&
          (selectedPromotor === "all" || r.promotor === selectedPromotor)
      );
      const tot = regs.reduce((s, r) => s + r.valor_total, 0);
      const dev = regs.reduce((s, r) => s + r.valor_devolvido, 0);
      return {
        mes: m.Mes_str,
        devolvido: dev,
        pct: tot > 0 ? parseFloat(((dev / tot) * 100).toFixed(2)) : 0,
        meta: META_PCT,
      };
    });

  // ─── Gráfico 2: % Devolução por Promotor ─────────────────────────────────
  const promotoresUnicos = Array.from(
    new Set(registrosFiltrados.map((r) => r.promotor))
  ).sort();

  const dadosPromotorGrafico = promotoresUnicos.map((promotor) => {
    const regs = registrosFiltrados.filter((r) => r.promotor === promotor);
    const tot = regs.reduce((s, r) => s + r.valor_total, 0);
    const dev = regs.reduce((s, r) => s + r.valor_devolvido, 0);
    const pct = tot > 0 ? parseFloat(((dev / tot) * 100).toFixed(2)) : 0;
    return { promotor, pct, meta: META_PCT };
  });

  // ─── Gráfico 3: Tendência Mês a Mês por Rota ─────────────────────────────
  const mesesDisponiveis = dados?.meses ?? [];

  const mesesTendencia = mesesDisponiveis.filter((m) => {
    if (tendenciaMesInicio === "all" && tendenciaMesFim === "all") return true;
    if (tendenciaMesInicio !== "all" && m.Mes_num < parseInt(tendenciaMesInicio))
      return false;
    if (tendenciaMesFim !== "all" && m.Mes_num > parseInt(tendenciaMesFim))
      return false;
    return true;
  });

  const rotasUnicas = Array.from(
    new Set((dados?.registros ?? []).map((r) => r.regiao))
  ).sort();

  const dadosTendencia = mesesTendencia.map((m) => {
    const ponto: Record<string, number | string> = { mes: m.Mes_str };
    rotasUnicas.forEach((rota) => {
      const regs = (dados?.registros ?? []).filter(
        (r) => r.mes === m.Mes_str && r.regiao === rota
      );
      const tot = regs.reduce((s, r) => s + r.valor_total, 0);
      const dev = regs.reduce((s, r) => s + r.valor_devolvido, 0);
      ponto[rota] = tot > 0 ? parseFloat(((dev / tot) * 100).toFixed(2)) : 0;
    });
    // linha geral
    const regsGeral = (dados?.registros ?? []).filter((r) => r.mes === m.Mes_str);
    const totGeral = regsGeral.reduce((s, r) => s + r.valor_total, 0);
    const devGeral = regsGeral.reduce((s, r) => s + r.valor_devolvido, 0);
    ponto["Geral"] = totGeral > 0 ? parseFloat(((devGeral / totGeral) * 100).toFixed(2)) : 0;
    return ponto;
  });

  const coresTendencia = [
    "#e95959", "#3b82f6", "#16a34a", "#f59e0b",
    "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16",
  ];

  // ─── Tabela 1: Resumo por Promotor ────────────────────────────────────────
  const resumoPromotor = promotoresUnicos.map((promotor) => {
    const regs = registrosFiltrados.filter((r) => r.promotor === promotor);
    const lojas = new Set(regs.map((r) => r.loja)).size;
    const vendas = regs.reduce((s, r) => s + r.valor_total, 0);
    const devolvido = regs.reduce((s, r) => s + r.valor_devolvido, 0);
    const pct = vendas > 0 ? (devolvido / vendas) * 100 : 0;
    const regiao = regs[0]?.regiao ?? "-";
    return { promotor, regiao, lojas, vendas, devolvido, pct };
  });

  // ─── Tabela 2: Detalhamento por Loja ─────────────────────────────────────
  const lojasUnicas = Array.from(
    new Set(registrosFiltrados.map((r) => r.loja))
  );

  const detalhamentoLoja = lojasUnicas
    .map((loja) => {
      const regs = registrosFiltrados.filter((r) => r.loja === loja);
      const ref = regs[0];
      const vendas = regs.reduce((s, r) => s + r.valor_total, 0);
      const devolvido = regs.reduce((s, r) => s + r.valor_devolvido, 0);
      const pct = vendas > 0 ? (devolvido / vendas) * 100 : 0;
      return {
        loja,
        nome: ref?.nome_loja ?? "-",
        promotor: ref?.promotor ?? "-",
        regiao: ref?.regiao ?? "-",
        dias: ref?.dias_visita?.join(", ") ?? "-",
        vendas,
        devolvido,
        pct,
      };
    })
    .sort((a, b) =>
      ordenacaoTabela === "pct" ? b.pct - a.pct : b.devolvido - a.devolvido
    );

  // ─── Exportar dashboard completo ─────────────────────────────────────────
  const exportarDashboardCompleto = useCallback(async () => {
    if (!dashboardRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 1.8,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: 1280,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const imgW = canvas.width;
      const imgH = canvas.height;
      const ratio = pdfW / (imgW / (1.8 * 3.7795));
      const totalH = imgH / (1.8 * 3.7795) * ratio;
      let posY = 0;
      let page = 0;
      while (posY < totalH) {
        if (page > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, -posY, pdfW, totalH);
        posY += pdfH;
        page++;
      }
      pdf.save("Dashboard_Devolucoes_Criativa.pdf");
    } finally {
      setIsExporting(false);
    }
  }, []);

  if (!dados) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="animate-spin mr-2" size={20} />
        <span>Carregando dados de devoluções...</span>
      </div>
    );
  }

  const mesesOpcoes = dados.meses;
  const promotoresOpcoes = Array.from(
    new Set(dados.registros.map((r) => r.promotor))
  ).sort();

  return (
    <DashboardLayout>
    <div
      className="min-h-screen p-4 md:p-6"
      style={{ backgroundColor: COR_FUNDO, fontFamily: "Roboto, sans-serif" }}
      ref={dashboardRef}
    >
      {/* ── Cabeçalho ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1
            className="text-2xl md:text-3xl font-bold"
            style={{
              fontFamily: "'Squada One', sans-serif",
              color: "#0e0e0e",
            }}
          >
            Dashboard de Devoluções
          </h1>
          <p className="text-sm mt-1" style={{ color: "#555" }}>
            Criativa Comércio e Representações — Rede Extrabom / Veneza
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#888" }}>
            Última atualização: {dados.ultima_atualizacao}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Filtro Mês */}
          <Select value={selectedMes} onValueChange={setSelectedMes}>
            <SelectTrigger className="w-36 bg-white border-gray-300">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os meses</SelectItem>
              {mesesOpcoes.map((m) => (
                <SelectItem key={m.Mes_num} value={m.Mes_str}>
                  {m.Mes_str}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtro Promotor */}
          <Select value={selectedPromotor} onValueChange={setSelectedPromotor}>
            <SelectTrigger className="w-40 bg-white border-gray-300">
              <SelectValue placeholder="Promotor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os promotores</SelectItem>
              {promotoresOpcoes.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Exportar PDF completo */}
          <button
            onClick={exportarDashboardCompleto}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: COR_PRINCIPAL }}
          >
            {isExporting ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <FileText size={14} />
            )}
            Exportar PDF
          </button>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div ref={kpiRef} className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <KpiCard
          titulo="% Devolução Geral"
          valor={fmtPct(pctGeralDevolucao)}
          cor={corStatus(pctGeralDevolucao)}
          icone={<TrendingDown size={18} />}
          badge={labelStatus(pctGeralDevolucao)}
        />
        <KpiCard
          titulo="Total Devolvido"
          valor={fmtBRL(totalDevolvido)}
          cor={COR_PRINCIPAL}
          icone={<DollarSign size={18} />}
        />
        <KpiCard
          titulo="Lojas Monitoradas"
          valor={String(lojasMonitoradas)}
          cor="#0e0e0e"
          icone={<Store size={18} />}
        />
        <KpiCard
          titulo="Promotores Ativos"
          valor={String(promotoresAtivos)}
          cor="#0e0e0e"
          icone={<Users size={18} />}
        />
        <KpiCard
          titulo="Lojas Acima da Meta"
          valor={String(lojasAcimaMeta)}
          cor={lojasAcimaMeta > 0 ? COR_CRITICO : COR_OK}
          icone={<AlertTriangle size={18} />}
          badge={`Meta: ${META_PCT}%`}
        />
      </div>

      {/* ── Gráfico 1: Evolução Mensal ── */}
      <Card className="mb-6 shadow-sm border-0">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle
            className="text-base font-semibold"
            style={{ color: "#0e0e0e" }}
          >
            Evolução Mensal de Devoluções
          </CardTitle>
          <div className="flex gap-2">
            <BotaoExportarCSV
              onClick={() =>
                exportarCSV(
                  evolucaoMensal.map((d) => ({
                    Mês: d.mes,
                    "Devolvido (R$)": d.devolvido.toFixed(2),
                    "% Devolução": d.pct,
                    "Meta (%)": d.meta,
                  })),
                  "evolucao_mensal.csv"
                )
              }
            />
            <BotaoExportarPDF
              onClick={() =>
                exportarPDF(graficoEvolucaoRef, "evolucao_mensal.pdf")
              }
            />
          </div>
        </CardHeader>
        <CardContent ref={graficoEvolucaoRef}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={evolucaoMensal}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e0e0" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis
                yAxisId="left"
                tickFormatter={(v) => fmtBRL(v)}
                tick={{ fontSize: 11 }}
                width={90}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(v) => v + "%"}
                tick={{ fontSize: 11 }}
                width={45}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === "Devolvido (R$)") return [fmtBRL(value), name];
                  return [fmtPct(value), name];
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="devolvido"
                name="Devolvido (R$)"
                stroke={COR_PRINCIPAL}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="pct"
                name="% Devolução"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <ReferenceLine
                yAxisId="right"
                y={META_PCT}
                stroke={COR_META}
                strokeDasharray="5 5"
                label={{ value: `Meta ${META_PCT}%`, fill: COR_META, fontSize: 11 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── Gráfico 2: % Devolução por Promotor ── */}
      <Card className="mb-6 shadow-sm border-0">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle
            className="text-base font-semibold"
            style={{ color: "#0e0e0e" }}
          >
            % Devolução por Promotor / Rota
          </CardTitle>
          <div className="flex gap-2">
            <BotaoExportarCSV
              onClick={() =>
                exportarCSV(
                  dadosPromotorGrafico.map((d) => ({
                    Promotor: d.promotor,
                    "% Devolução": d.pct,
                    "Meta (%)": d.meta,
                    Status: labelStatus(d.pct),
                  })),
                  "pct_por_promotor.csv"
                )
              }
            />
            <BotaoExportarPDF
              onClick={() =>
                exportarPDF(graficoPromotorRef, "pct_por_promotor.pdf")
              }
            />
          </div>
        </CardHeader>
        <CardContent ref={graficoPromotorRef}>
          <ResponsiveContainer
            width="100%"
            height={Math.max(200, dadosPromotorGrafico.length * 44)}
          >
            <BarChart
              data={dadosPromotorGrafico}
              layout="vertical"
              margin={{ left: 10, right: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e0e0" />
              <XAxis
                type="number"
                tickFormatter={(v) => v + "%"}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey="promotor"
                tick={{ fontSize: 12 }}
                width={80}
              />
              <Tooltip
                formatter={(v: number) => [fmtPct(v), "% Devolução"]}
              />
              <ReferenceLine
                x={META_PCT}
                stroke={COR_META}
                strokeDasharray="5 5"
                label={{
                  value: `Meta ${META_PCT}%`,
                  fill: COR_META,
                  fontSize: 11,
                  position: "top",
                }}
              />
              <Bar dataKey="pct" name="% Devolução" radius={[0, 4, 4, 0]}>
                {dadosPromotorGrafico.map((entry, i) => (
                  <Cell key={i} fill={corStatus(entry.pct)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── Gráfico 3: Tendência Mês a Mês por Rota ── */}
      <Card className="mb-6 shadow-sm border-0">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <CardTitle
              className="text-base font-semibold"
              style={{ color: "#0e0e0e" }}
            >
              Tendência Mês a Mês por Rota
            </CardTitle>
            <div className="flex flex-wrap gap-2 items-center">
              {/* Filtros independentes de período */}
              <Select
                value={tendenciaMesInicio}
                onValueChange={setTendenciaMesInicio}
              >
                <SelectTrigger className="w-32 bg-white border-gray-300 text-xs">
                  <SelectValue placeholder="Mês inicial" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Início</SelectItem>
                  {mesesOpcoes.map((m) => (
                    <SelectItem key={m.Mes_num} value={String(m.Mes_num)}>
                      {m.Mes_str}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={tendenciaMesFim}
                onValueChange={setTendenciaMesFim}
              >
                <SelectTrigger className="w-32 bg-white border-gray-300 text-xs">
                  <SelectValue placeholder="Mês final" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Fim</SelectItem>
                  {mesesOpcoes.map((m) => (
                    <SelectItem key={m.Mes_num} value={String(m.Mes_num)}>
                      {m.Mes_str}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <BotaoExportarCSV
                  onClick={() => {
                    const linhas = dadosTendencia.map((d) => {
                      const row: Record<string, string | number> = {
                        Mês: d.mes as string,
                      };
                      rotasUnicas.forEach((r) => {
                        row[r] = Number(d[r]).toFixed(2) + "%";
                      });
                      row["Geral"] = Number(d["Geral"]).toFixed(2) + "%";
                      return row;
                    });
                    exportarCSV(linhas, "tendencia_por_rota.csv");
                  }}
                />
                <BotaoExportarPDF
                  onClick={() =>
                    exportarPDF(graficoTendenciaRef, "tendencia_por_rota.pdf")
                  }
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent ref={graficoTendenciaRef}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosTendencia}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e0e0" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(v) => v + "%"}
                tick={{ fontSize: 11 }}
                width={40}
              />
              <Tooltip formatter={(v: number) => [fmtPct(v)]} />
              <Legend />
              <ReferenceLine
                y={META_PCT}
                stroke={COR_META}
                strokeDasharray="5 5"
                label={{
                  value: `Meta ${META_PCT}%`,
                  fill: COR_META,
                  fontSize: 11,
                }}
              />
              {rotasUnicas.map((rota, i) => (
                <Line
                  key={rota}
                  type="monotone"
                  dataKey={rota}
                  stroke={coresTendencia[i % coresTendencia.length]}
                  strokeWidth={1.5}
                  dot={{ r: 3 }}
                />
              ))}
              <Line
                type="monotone"
                dataKey="Geral"
                stroke="#0e0e0e"
                strokeWidth={2.5}
                dot={{ r: 4 }}
                strokeDasharray="4 2"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── Tabela 1: Resumo por Promotor ── */}
      <Card className="mb-6 shadow-sm border-0">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle
            className="text-base font-semibold"
            style={{ color: "#0e0e0e" }}
          >
            Resumo por Promotor / Rota
          </CardTitle>
          <div className="flex gap-2">
            <BotaoExportarCSV
              onClick={() =>
                exportarCSV(
                  resumoPromotor.map((r) => ({
                    Promotor: r.promotor,
                    Região: r.regiao,
                    Lojas: r.lojas,
                    "Vendas (R$)": r.vendas.toFixed(2),
                    "Devolvido (R$)": r.devolvido.toFixed(2),
                    "% Dev.": r.pct.toFixed(1),
                    Status: labelStatus(r.pct),
                  })),
                  "resumo_por_promotor.csv"
                )
              }
            />
            <BotaoExportarPDF
              onClick={() =>
                exportarPDF(tabelaPromotorRef, "resumo_por_promotor.pdf")
              }
            />
          </div>
        </CardHeader>
        <CardContent ref={tabelaPromotorRef}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="text-left text-xs uppercase"
                  style={{ backgroundColor: COR_PRINCIPAL, color: "#fff" }}
                >
                  <th className="px-3 py-2 rounded-tl-md">Promotor</th>
                  <th className="px-3 py-2">Região</th>
                  <th className="px-3 py-2 text-center">Lojas</th>
                  <th className="px-3 py-2 text-right">Vendas</th>
                  <th className="px-3 py-2 text-right">Devolvido</th>
                  <th className="px-3 py-2 text-right">% Dev.</th>
                  <th className="px-3 py-2 rounded-tr-md text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {resumoPromotor.map((r, i) => (
                  <tr
                    key={r.promotor}
                    className="border-b"
                    style={{
                      backgroundColor: i % 2 === 0 ? "#fff" : COR_FUNDO,
                    }}
                  >
                    <td className="px-3 py-2 font-medium">{r.promotor}</td>
                    <td className="px-3 py-2 text-gray-600">{r.regiao}</td>
                    <td className="px-3 py-2 text-center">{r.lojas}</td>
                    <td className="px-3 py-2 text-right">{fmtBRL(r.vendas)}</td>
                    <td className="px-3 py-2 text-right">{fmtBRL(r.devolvido)}</td>
                    <td
                      className="px-3 py-2 text-right font-semibold"
                      style={{ color: corStatus(r.pct) }}
                    >
                      {fmtPct(r.pct)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <StatusBadge pct={r.pct} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Tabela 2: Detalhamento por Loja ── */}
      <Card className="mb-6 shadow-sm border-0">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle
            className="text-base font-semibold"
            style={{ color: "#0e0e0e" }}
          >
            Detalhamento por Loja
          </CardTitle>
          <div className="flex gap-2 items-center">
            <Select
              value={ordenacaoTabela}
              onValueChange={(v) => setOrdenacaoTabela(v as "pct" | "valor")}
            >
              <SelectTrigger className="w-36 bg-white border-gray-300 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pct">Ordenar por %</SelectItem>
                <SelectItem value="valor">Ordenar por Valor</SelectItem>
              </SelectContent>
            </Select>
            <BotaoExportarCSV
              onClick={() =>
                exportarCSV(
                  detalhamentoLoja.map((r) => ({
                    Loja: r.loja,
                    Nome: r.nome,
                    Promotor: r.promotor,
                    Região: r.regiao,
                    "Dias de Visita": r.dias,
                    "Vendas (R$)": r.vendas.toFixed(2),
                    "Devolvido (R$)": r.devolvido.toFixed(2),
                    "% Dev.": r.pct.toFixed(1),
                  })),
                  "detalhamento_por_loja.csv"
                )
              }
            />
            <BotaoExportarPDF
              onClick={() =>
                exportarPDF(tabelaLojaRef, "detalhamento_por_loja.pdf")
              }
            />
          </div>
        </CardHeader>
        <CardContent ref={tabelaLojaRef}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="text-left text-xs uppercase"
                  style={{ backgroundColor: "#0e0e0e", color: "#fff" }}
                >
                  <th className="px-3 py-2 rounded-tl-md">Loja</th>
                  <th className="px-3 py-2">Nome</th>
                  <th className="px-3 py-2">Promotor</th>
                  <th className="px-3 py-2">Região</th>
                  <th className="px-3 py-2">Dias Visita</th>
                  <th className="px-3 py-2 text-right">Vendas</th>
                  <th className="px-3 py-2 text-right">Devolvido</th>
                  <th className="px-3 py-2 text-right rounded-tr-md">% Dev.</th>
                </tr>
              </thead>
              <tbody>
                {detalhamentoLoja.map((r, i) => (
                  <tr
                    key={r.loja}
                    className="border-b"
                    style={{
                      backgroundColor:
                        r.pct > 10
                          ? "#fff0f0"
                          : i % 2 === 0
                          ? "#fff"
                          : COR_FUNDO,
                    }}
                  >
                    <td className="px-3 py-2 font-mono text-xs">{r.loja}</td>
                    <td className="px-3 py-2 font-medium text-xs">{r.nome}</td>
                    <td className="px-3 py-2 text-gray-600 text-xs">
                      {r.promotor}
                    </td>
                    <td className="px-3 py-2 text-gray-600 text-xs">
                      {r.regiao}
                    </td>
                    <td className="px-3 py-2 text-gray-500 text-xs">{r.dias}</td>
                    <td className="px-3 py-2 text-right text-xs">
                      {fmtBRL(r.vendas)}
                    </td>
                    <td className="px-3 py-2 text-right text-xs">
                      {fmtBRL(r.devolvido)}
                    </td>
                    <td
                      className="px-3 py-2 text-right font-bold text-xs"
                      style={{ color: corStatus(r.pct) }}
                    >
                      {fmtPct(r.pct)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Rodapé ── */}
      <p className="text-center text-xs mt-4" style={{ color: "#aaa" }}>
        Criativa Comércio e Representações Ltda — Dashboard de Devoluções —
        Dados: Rede Extrabom / Veneza
      </p>
    </div>
    </DashboardLayout>
  );
}

// ─── Sub-componentes ───────────────────────────────────────────────────────────
function KpiCard({
  titulo,
  valor,
  cor,
  icone,
  badge,
}: {
  titulo: string;
  valor: string;
  cor: string;
  icone: React.ReactNode;
  badge?: string;
}) {
  return (
    <Card className="shadow-sm border-0 bg-white">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            {titulo}
          </span>
          <span style={{ color: cor }}>{icone}</span>
        </div>
        <div className="text-xl font-bold" style={{ color: cor }}>
          {valor}
        </div>
        {badge && (
          <div className="text-xs mt-1" style={{ color: cor }}>
            {badge}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ pct }: { pct: number }) {
  const s = getStatus(pct);
  const styles: Record<string, string> = {
    ok: "bg-green-100 text-green-800",
    atencao: "bg-yellow-100 text-yellow-800",
    critico: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${styles[s]}`}
    >
      {labelStatus(pct)}
    </span>
  );
}

function BotaoExportarCSV({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="Exportar CSV"
      className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium text-white hover:opacity-90 transition-opacity"
      style={{ backgroundColor: "#16a34a" }}
    >
      <Download size={12} />
      CSV
    </button>
  );
}

function BotaoExportarPDF({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="Exportar PDF"
      className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium text-white hover:opacity-90 transition-opacity"
      style={{ backgroundColor: COR_PRINCIPAL }}
    >
      <FileText size={12} />
      PDF
    </button>
  );
}
