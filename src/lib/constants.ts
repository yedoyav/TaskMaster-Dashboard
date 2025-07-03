
export const DATE_LOCALE = 'pt-BR';
export const DEFAULT_DECIMAL_PLACES = 1;
export const CHART_FONT_SIZE = 12;

export const HOJE = (() => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return hoje;
})();

export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day; // Domingo como início
  const startOfWeek = new Date(d.setDate(diff));
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
}

export function getEndOfWeek(date: Date): Date {
  const start = getStartOfWeek(date);
  const endOfWeek = new Date(start);
  endOfWeek.setDate(start.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return endOfWeek;
}

export const START_OF_CURRENT_WEEK = getStartOfWeek(HOJE);
export const END_OF_CURRENT_WEEK = getEndOfWeek(HOJE);

export const STATUS_COLORS: Record<string, string> = {
  'Pendente': 'hsl(var(--primary))',
  'Em andamento': 'hsl(var(--accent))',
  'Finalizado': 'var(--status-green)',
  'Atrasada': 'var(--status-yellow)',
  'Pausada': 'var(--status-yellow)',
  'Descontinuada': 'hsl(var(--muted-foreground))',
  'Outras Ativas': 'var(--status-blue)',
  'default': 'hsl(var(--border))',
};

// Used for text color in tables/lists
export const PRIORITY_TEXT_CLASSES: Record<string, string> = {
  '1': 'text-status-red font-semibold',    // Alta
  '2': 'text-status-yellow font-medium', // Média
  '3': 'text-status-blue',   // Baixa
  'default': 'text-foreground',
};

// Used for chart colors
export const PRIORITY_CHART_COLORS: Record<string, string> = {
  'Alta': 'hsl(var(--chart-5))', // Example: a distinct red/orange
  'Média': 'hsl(var(--chart-4))', // Example: a distinct yellow
  'Baixa': 'hsl(var(--chart-3))',   // Example: a distinct blue/green
  'N/D': 'hsl(var(--muted))',
};

export function getStatusColor(statusKey?: string): string {
  if (!statusKey) return STATUS_COLORS['default'];
  const color = STATUS_COLORS[statusKey] || STATUS_COLORS['default'];
  if (color.startsWith('var(--')) {
    const variableName = color.match(/var\((--[^)]+)\)/)?.[1];
    if (variableName) {
      const colorMapForJs: Record<string, string> = {
        'hsl(var(--primary))': '#8a79ab',
        'hsl(var(--accent))': '#e6a5b8',
        'var(--status-green)': '#48BB78',
        'var(--status-yellow)': '#ECC94B',
        'var(--status-blue)': '#4299E1',
        'hsl(var(--muted-foreground))': '#6b6880',
        'hsl(var(--border))': '#cec9d9',
      };
      return colorMapForJs[color] || '#cec9d9'; // fallback
    }
  }
  return color;
}

export function getPriorityColorClass(priorityValue?: string | number): string {
  if (priorityValue === undefined || priorityValue === null) return PRIORITY_TEXT_CLASSES['default'];
  return PRIORITY_TEXT_CLASSES[String(priorityValue)] || PRIORITY_TEXT_CLASSES['default'];
}

export function getPriorityChartColor(priorityLabel: string): string {
  return PRIORITY_CHART_COLORS[priorityLabel] || PRIORITY_CHART_COLORS['N/D'];
}

export function getPriorityLabel(priorityValue?: number | string): string {
  if (priorityValue === 1 || priorityValue === '1') return 'Alta';
  if (priorityValue === 2 || priorityValue === '2') return 'Média';
  if (priorityValue === 3 || priorityValue === '3') return 'Baixa';
  return 'N/D';
}


// Define Task interface
export interface Task {
  [key: string]: any; // Allow any other properties from CSV
  'ID da tarefa': number;
  'Tarefa': string;
  'Status': string;
  'Responsável'?: string;
  'Estratégia'?: string;
  'Prioridade'?: number; // 1 (Alta), 2 (Média), 3 (Baixa)
  'Carga de Trabalho'?: number; // hours
  'Data de criação'?: Date | null;
  'Última atualização'?: Date | null;
  'Data de início'?: Date | null;
  'Prazo'?: Date | null;
  'Data de finalização'?: Date | null;
  'Tempo de Tracking'?: string; // Original string e.g. "1:30:00"
  'Tempo de Tracking (Horas)'?: number;
  'Pausada'?: string; // "Sim" or "Não"
  'Pendente com'?: string;
  'urlApp'?: string;
  'urlCliente'?: string;
  'Etapa'?: string;

  // Calculated fields
  AtrasadaCalculado?: boolean;
  DesatualizadaCalculado?: boolean;
  FinalizadaNestaSemanaCalculado?: boolean;
  PrioridadeAltaPendenteCalculado?: boolean;
  ComPendenciaExternaCalculado?: boolean;
  SemanaConclusao?: string | null; // YYYY-Www
  SemanaCriacao?: string | null; // YYYY-Www
  AtivaCalculado?: boolean;
  _error?: boolean;
}
