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
  'Pendente': 'hsl(var(--primary))', // yav-purple like
  'Em andamento': 'hsl(var(--accent))', // yav-cyan like (using accent)
  'Finalizado': 'var(--status-green)',
  'Atrasada': 'var(--status-yellow)',
  'Pausada': 'var(--status-yellow)',
  'Descontinuada': 'hsl(var(--muted-foreground))',
  'Outras Ativas': 'var(--status-blue)',
  'default': 'hsl(var(--border))',
};

export const PRIORITY_TEXT_CLASSES: Record<string, string> = {
  '1': 'text-status-red',    // Alta
  '2': 'text-status-yellow', // Média
  '3': 'text-status-blue',   // Baixa
  'default': 'text-foreground',
};

export function getStatusColor(statusKey?: string): string {
  if (!statusKey) return STATUS_COLORS['default'];
  // Handle direct CSS variable strings
  const color = STATUS_COLORS[statusKey] || STATUS_COLORS['default'];
  if (color.startsWith('var(--')) {
    const variableName = color.match(/var\((--[^)]+)\)/)?.[1];
    if (variableName) {
      // This requires dynamically getting CSS var in JS, which is complex.
      // For Chart.js, it's better to ensure STATUS_COLORS stores actual hex/hsl values if possible,
      // or use Tailwind class names if the component supports it.
      // For now, let's assume the chart components will handle these string values if they are CSS vars.
      // A simpler approach for charts is to map them to the --chart-N variables or fixed hex values.
      // For this migration, we'll keep it as is and adjust Chart.js colors if needed.
      // For direct style attributes, this won't work directly.
      // This function is mostly for providing keys that map to Tailwind classes or fixed colors.
      
      // Fallback for direct use if var() not resolved (e.g. canvas charts)
      const colorMapForJs: Record<string, string> = {
        'hsl(var(--primary))': '#7C3AED',
        'hsl(var(--accent))': '#06B6D4',
        'var(--status-green)': '#48BB78',
        'var(--status-yellow)': '#ECC94B',
        'var(--status-blue)': '#4299E1',
        'hsl(var(--muted-foreground))': '#a1a1aa',
        'hsl(var(--border))': '#3f3f46',
      };
      return colorMapForJs[color] || '#3f3f46';
    }
  }
  return color;
}


export function getPriorityColorClass(priorityValue?: string | number): string {
  if (priorityValue === undefined || priorityValue === null) return PRIORITY_TEXT_CLASSES['default'];
  return PRIORITY_TEXT_CLASSES[String(priorityValue)] || PRIORITY_TEXT_CLASSES['default'];
}

// Define Task interface
export interface Task {
  [key: string]: any; // Allow any other properties from CSV
  'ID da tarefa': number;
  'Tarefa': string;
  'Status': string;
  'Responsável'?: string;
  'Estratégia'?: string;
  'Prioridade'?: number;
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
