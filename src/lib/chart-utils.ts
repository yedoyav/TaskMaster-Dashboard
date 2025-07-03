
import type { Task } from './constants';
import { STATUS_COLORS, DEFAULT_DECIMAL_PLACES, getStatusColor, getPriorityLabel, getPriorityChartColor } from './constants';
import { formatHoursToFriendlyString, formatWeekIdentifierToDateDisplay } from './utils';
import type { ChartConfig } from '@/components/ui/chart';

// Overall Status Gauge (Doughnut)
export interface OverallStatusChartData {
  datasets: {
    data: number[];
    backgroundColor: string[];
    labels: string[];
    borderColor?: string;
    borderWidth?: number;
    circumference?: number;
    rotation?: number;
    cutout?: string;
    hoverOffset?: number;
  }[];
  labels?: string[];
}

export interface OverallStatusSummaryItem {
  key: string;
  label: string;
  count: number;
  color: string;
  isBold?: boolean;
}

export interface OverallStatusProcessedData {
  chartData: OverallStatusChartData;
  summaryData: OverallStatusSummaryItem[];
  progressPercentage: number;
}

export function processOverallStatusData(tasks: Task[]): OverallStatusProcessedData {
  const completedCount = tasks.filter(r => r.Status === 'Finalizado').length;
  const delayedCount = tasks.filter(r => r.AtrasadaCalculado && r.Status !== 'Finalizado').length;
  const onGoingCount = tasks.filter(r => r.Status === 'Em andamento').length;
  const pendingCount = tasks.filter(r => r.Status === 'Pendente').length;

  const totalRelevantForGaugeSegments = onGoingCount + completedCount + delayedCount + pendingCount;
  const progressPercentage = totalRelevantForGaugeSegments > 0 ? (completedCount / totalRelevantForGaugeSegments) * 100 : 0;

  const gaugeSegmentsData: number[] = [];
  const gaugeSegmentsColors: string[] = [];
  const gaugeSegmentLabels: string[] = [];

  if (completedCount > 0) {
    gaugeSegmentsData.push(completedCount);
    gaugeSegmentsColors.push(getStatusColor('Finalizado'));
    gaugeSegmentLabels.push('Finalizadas');
  }
  if (onGoingCount > 0) {
    gaugeSegmentsData.push(onGoingCount);
    gaugeSegmentsColors.push(getStatusColor('Em andamento'));
    gaugeSegmentLabels.push('Em Andamento');
  }
  if (pendingCount > 0) {
    gaugeSegmentsData.push(pendingCount);
    gaugeSegmentsColors.push(getStatusColor('Pendente'));
    gaugeSegmentLabels.push('Pendentes');
  }
  if (delayedCount > 0) {
    gaugeSegmentsData.push(delayedCount);
    gaugeSegmentsColors.push(getStatusColor('Atrasada'));
    gaugeSegmentLabels.push('Atrasadas');
  }
  
  if (gaugeSegmentsData.length === 0 && tasks.length > 0) {
    gaugeSegmentsData.push(tasks.length);
    gaugeSegmentsColors.push(getStatusColor('default'));
    gaugeSegmentLabels.push('Outro Status');
  } else if (gaugeSegmentsData.length === 0 && tasks.length === 0) {
     gaugeSegmentsData.push(1); 
     gaugeSegmentsColors.push(getStatusColor('default'));
     gaugeSegmentLabels.push('N/D');
  }

  const chartData: OverallStatusChartData = {
    datasets: [{
      data: gaugeSegmentsData,
      backgroundColor: gaugeSegmentsColors,
      labels: gaugeSegmentLabels,
      borderColor: 'hsl(var(--card))',
      borderWidth: 2,
      circumference: 270,
      rotation: -135,
      cutout: '70%',
      hoverOffset: 4,
    }],
  };

  const summaryData: OverallStatusSummaryItem[] = [
    { key: 'TotalTarefas', label: 'Total Tarefas', count: tasks.length, color: 'hsl(var(--foreground))', isBold: true },
    { key: 'Finalizado', label: 'Finalizadas', count: completedCount, color: getStatusColor('Finalizado') },
    { key: 'Em andamento', label: 'Em Andamento', count: onGoingCount, color: getStatusColor('Em andamento') },
    { key: 'Pendente', label: 'Pendentes', count: pendingCount, color: getStatusColor('Pendente') },
    { key: 'Atrasada', label: 'Atrasadas', count: delayedCount, color: getStatusColor('Atrasada') },
  ];

  return { chartData, summaryData, progressPercentage };
}


// Etapa Distribution (Bar Chart)
export interface EtapaDistributionChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderRadius?: number;
  }[];
}

export function processEtapaDistributionData(tasks: Task[]): EtapaDistributionChartData {
  const etapaCounts = tasks.reduce((acc, row) => {
    const etapa = row['Etapa'] || 'Não definida';
    acc[etapa] = (acc[etapa] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const labels = Object.keys(etapaCounts);
  const data = Object.values(etapaCounts);

  return {
    labels,
    datasets: [{
      label: 'Nº de Tarefas',
      data,
      backgroundColor: 'var(--primary)',
      borderRadius: 4,
    }]
  };
}

// Weekly Conclusion Trend (Line Chart)
export interface WeeklyTrendChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
    tension: number;
    pointRadius?: number;
    pointBackgroundColor?: string;
  }[];
}

export function processWeeklyTrendData(allTasks: Task[]): WeeklyTrendChartData {
  const weeklyData: Record<string, { created_this_week: number, completed_this_week: number }> = {};
  const allWeeksSet = new Set<string>();

  allTasks.forEach(row => {
    if (row.SemanaCriacao) allWeeksSet.add(row.SemanaCriacao);
    if (row.SemanaConclusao) allWeeksSet.add(row.SemanaConclusao);
  });

  const sortedWeeks = Array.from(allWeeksSet).sort();
  
  // If no weeks, return empty data structure for chart
  if (sortedWeeks.length === 0) {
    return {
      labels: [],
      datasets: [
        { label: 'Concluídas (Acum.)', data: [], borderColor: 'var(--chart-3)', backgroundColor: 'var(--chart-3)', fill: true, tension: 0.3 },
        { label: 'Não Concluídas (Acum.)', data: [], borderColor: 'var(--chart-1)', backgroundColor: 'var(--chart-1)', fill: true, tension: 0.3 }
      ]
    };
  }
  
  const formattedLabels = sortedWeeks.map(weekId => formatWeekIdentifierToDateDisplay(weekId));

  sortedWeeks.forEach(week => {
    if (!weeklyData[week]) weeklyData[week] = { created_this_week: 0, completed_this_week: 0 };
  });

  allTasks.forEach(row => {
    if (row.SemanaCriacao && weeklyData[row.SemanaCriacao]) {
      weeklyData[row.SemanaCriacao].created_this_week++;
    }
    if (row.SemanaConclusao && weeklyData[row.SemanaConclusao]) {
      weeklyData[row.SemanaConclusao].completed_this_week++;
    }
  });

  let accumulatedCreated = 0;
  let accumulatedCompleted = 0;
  const completedTrend: number[] = [];
  const activeTrend: number[] = [];

  sortedWeeks.forEach(week => {
    accumulatedCreated += (weeklyData[week]?.created_this_week || 0);
    accumulatedCompleted += (weeklyData[week]?.completed_this_week || 0);
    completedTrend.push(accumulatedCompleted);
    activeTrend.push(Math.max(0, accumulatedCreated - accumulatedCompleted));
  });

  return {
    labels: formattedLabels,
    datasets: [
      {
        label: 'Concluídas (Acum.)',
        data: completedTrend,
        borderColor: 'var(--chart-3)',
        backgroundColor: 'var(--chart-3)',
        fill: true,
        tension: 0.3,
        pointRadius: 2,
        pointBackgroundColor: 'var(--chart-3)',
      },
      {
        label: 'Não Concluídas (Acum.)',
        data: activeTrend,
        borderColor: 'var(--chart-1)',
        backgroundColor: 'var(--chart-1)',
        fill: true,
        tension: 0.3,
        pointRadius: 2,
        pointBackgroundColor: 'var(--chart-1)',
      }
    ]
  };
}

// Progress List Data
export interface ProgressListItem {
  name: string;
  total: number;
  completed: number;
  percentage: number;
}

export function processProgressListData(tasks: Task[], groupField: keyof Task): ProgressListItem[] {
  const progressData: Record<string, { total: number; completed: number }> = {};

  tasks
    .filter(r => String(r['Pausada']).toLowerCase() !== 'sim' && r.Status !== 'Descontinuada')
    .forEach(row => {
      const groupValue = String(row[groupField]) || 'N/A';
      if (!progressData[groupValue]) {
        progressData[groupValue] = { total: 0, completed: 0 };
      }
      progressData[groupValue].total++;
      if (row.Status === 'Finalizado') {
        progressData[groupValue].completed++;
      }
    });

  return Object.entries(progressData)
    .map(([name, stats]) => ({
      name,
      ...stats,
      percentage: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Priority Distribution (Pie Chart)
export interface PriorityDistributionChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor?: string;
    borderWidth?: number;
    hoverOffset?: number;
  }[];
}

export function processPriorityDistributionData(tasks: Task[]): PriorityDistributionChartData {
  const priorityCounts: Record<string, number> = { 'Alta': 0, 'Média': 0, 'Baixa': 0, 'N/D': 0 };

  tasks.forEach(task => {
    const priorityLabel = getPriorityLabel(task.Prioridade);
    priorityCounts[priorityLabel]++;
  });

  const labels = Object.keys(priorityCounts).filter(label => priorityCounts[label] > 0);
  const data = labels.map(label => priorityCounts[label]);
  const backgroundColors = labels.map(label => getPriorityChartColor(label));

  if (labels.length === 0 && tasks.length > 0) { // All tasks have undefined priority leading to N/D, but N/D count is 0
    return {
      labels: ['Nenhuma prioridade definida'],
      datasets: [{
        label: 'Tarefas',
        data: [tasks.length],
        backgroundColor: [getPriorityChartColor('N/D')],
        borderColor: 'hsl(var(--card))',
        borderWidth: 1,
        hoverOffset: 4,
      }]
    };
  }
  if (labels.length === 0 && tasks.length === 0) {
    return {
      labels: ['N/D'],
      datasets: [{
        label: 'Tarefas',
        data: [1], // Placeholder for empty chart
        backgroundColor: [getPriorityChartColor('N/D')],
      }]
    };
  }


  return {
    labels,
    datasets: [{
      label: 'Tarefas',
      data,
      backgroundColor: backgroundColors,
      borderColor: 'hsl(var(--card))',
      borderWidth: 2,
      hoverOffset: 4,
    }]
  };
}


// Chart configurations to be used with ShadCN Chart components
export const barChartConfig = { // For EtapaDistributionChart
  tasks: { // Corresponds to dataKey in BarChart
    label: "Nº de Tarefas",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export const lineChartConfig = { // For WeeklyConclusionTrendChart
  completed: {
    label: "Concluídas (Acum.)",
    color: "var(--chart-3)",
  },
  active: { // "active" here means "Não Concluídas (Acum.)"
    label: "Não Concluídas (Acum.)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export const priorityPieChartConfig = (labels: string[], colors: string[]): ChartConfig => {
  const config: ChartConfig = {};
  labels.forEach((label, index) => {
    // Create a key from label suitable for CSS variable or object key
    const key = label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    config[key || `item-${index}`] = {
      label: label,
      color: colors[index] || 'hsl(var(--chart-1))',
    };
  });
  return config;
};
