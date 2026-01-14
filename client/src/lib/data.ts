// Dados mockados baseados nas planilhas e informações do projeto Preferenza

export interface KPI {
  id: string;
  label: string;
  value: string | number;
  change?: number; // percentual de mudança
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
  icon?: string;
}

export interface RotaData {
  id: string;
  nome: string;
  supervisor: string;
  vendedores: number;
  faturamento: number;
  meta: number;
  unidadesPadrao: number;
  custoTotal: number;
  margemContribuicao: number;
  percentualCusto: number;
}

export interface VendedorData {
  id: string;
  nome: string;
  rota: string;
  supervisor: string;
  faturamento: number;
  meta: number;
  unidadesPadrao: number;
  status: 'Atingiu' | 'Em Andamento' | 'Abaixo';
}

// KPIs Gerais (Visão Executiva)
export const kpisGerais: KPI[] = [
  {
    id: 'faturamento-anual',
    label: 'Faturamento Anual (2024)',
    value: 'R$ 17.898.785',
    trend: 'up',
    change: 12.5,
    description: 'Meta 2026: R$ 35M',
    icon: 'DollarSign'
  },
  {
    id: 'faturamento-mensal',
    label: 'Faturamento Mensal (Médio)',
    value: 'R$ 1.491.565',
    trend: 'up',
    change: 5.2,
    description: 'Baseado no histórico recente',
    icon: 'TrendingUp'
  },
  {
    id: 'equipe',
    label: 'Força de Vendas',
    value: '260+',
    description: '10 Gestores, 250+ Promotores',
    icon: 'Users'
  },
  {
    id: 'produtividade',
    label: 'Produtividade Média',
    value: '2.150 UP',
    trend: 'down',
    change: -6.5,
    description: 'Meta: 2.300 UP/promotor',
    icon: 'Activity'
  }
];

// Dados por Grupo de Produto
export const vendasPorProduto = [
  { name: 'Pizza', value: 14729454, color: 'var(--chart-1)' },
  { name: 'Pastel', value: 3170787, color: 'var(--chart-3)' },
];

// Dados Comparativos de Cenários (Supervisão)
export const cenariosSupervisao = [
  {
    name: 'Cenário 1 (Atual)',
    supervisores: 3,
    custoTotal: 23593.86,
    faturamentoTotal: 556577.00,
    percentualCusto: 4.24,
    margemContribuicao: 532983.14,
    mediaPessoasPorSup: 15.7
  },
  {
    name: 'Cenário 2 (Proposto)',
    supervisores: 4,
    custoTotal: 31458.48,
    faturamentoTotal: 556577.00,
    percentualCusto: 5.65,
    margemContribuicao: 525118.52,
    mediaPessoasPorSup: 11.8
  }
];

// Dados Detalhados por Rota (Cenário 2 - Proposto)
export const performanceRotas: RotaData[] = [
  {
    id: 'norte',
    nome: 'Rota Norte',
    supervisor: 'A Definir',
    vendedores: 12,
    faturamento: 127850.00,
    meta: 140000.00,
    unidadesPadrao: 27600,
    custoTotal: 7864.62,
    margemContribuicao: 119985.38,
    percentualCusto: 6.15
  },
  {
    id: 'sul',
    nome: 'Rota Sul',
    supervisor: 'A Definir',
    vendedores: 11,
    faturamento: 77680.00,
    meta: 85000.00,
    unidadesPadrao: 16500,
    custoTotal: 7864.62,
    margemContribuicao: 69815.38,
    percentualCusto: 10.12
  },
  {
    id: 'gv1',
    nome: 'Rota GV 1',
    supervisor: 'A Definir',
    vendedores: 12,
    faturamento: 177523.50,
    meta: 190000.00,
    unidadesPadrao: 38400,
    custoTotal: 7864.62,
    margemContribuicao: 169658.88,
    percentualCusto: 4.43
  },
  {
    id: 'gv2',
    nome: 'Rota GV 2',
    supervisor: 'A Definir',
    vendedores: 12,
    faturamento: 173523.50,
    meta: 190000.00,
    unidadesPadrao: 37800,
    custoTotal: 7864.62,
    margemContribuicao: 165658.88,
    percentualCusto: 4.54
  }
];

// Dados de Metas em Andamento (Amostra)
export const metasAndamento = [
  { mes: 'Jan', realizado: 85, meta: 100 },
  { mes: 'Fev', realizado: 88, meta: 100 },
  { mes: 'Mar', realizado: 92, meta: 100 },
  { mes: 'Abr', realizado: 90, meta: 100 },
  { mes: 'Mai', realizado: 95, meta: 100 },
  { mes: 'Jun', realizado: 82, meta: 100 },
];

// Dados de Negociações (Funnel)
export const funilVendas = [
  { stage: 'Prospecção', value: 45, fill: 'var(--chart-1)' },
  { stage: 'Em Negociação', value: 28, fill: 'var(--chart-2)' },
  { stage: 'Proposta Enviada', value: 15, fill: 'var(--chart-3)' },
  { stage: 'Fechamento', value: 12, fill: 'var(--chart-4)' },
];
