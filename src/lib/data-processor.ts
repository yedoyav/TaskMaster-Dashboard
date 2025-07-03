
import { HOJE, START_OF_CURRENT_WEEK, END_OF_CURRENT_WEEK, Task } from './constants';

export function convertTrackingTimeToHours(timeStr?: string | number): number {
  if (timeStr === undefined || timeStr === null || timeStr === "-" || String(timeStr).trim() === '') {
    return 0;
  }

  const sTimeStr = String(timeStr).trim();
  const parts = sTimeStr.split(':');
  let hours = 0, minutes = 0, seconds = 0;

  if (parts.length === 3) {
    hours = parseInt(parts[0], 10);
    minutes = parseInt(parts[1], 10);
    seconds = parseInt(parts[2], 10);
  } else if (parts.length === 2) {
    minutes = parseInt(parts[0], 10);
    seconds = parseInt(parts[1], 10);
  } else if (parts.length === 1 && !isNaN(parseFloat(sTimeStr))) {
    const singleValue = parseFloat(sTimeStr);
    if (singleValue < 0) {
      console.warn(`Valor de tempo decimal negativo: '${sTimeStr}'. Tratado como 0.`);
      return 0;
    }
    return singleValue;
  } else {
    console.warn(`Formato de Tempo de Tracking não reconhecido: '${sTimeStr}'. Tratado como 0.`);
    return 0;
  }

  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds) ||
    hours < 0 || minutes < 0 || seconds < 0 ||
    minutes >= 60 || seconds >= 60) {
    console.warn(`Componentes de tempo inválidos: '${sTimeStr}'. Tratado como 0.`);
    return 0;
  }
  return hours + (minutes / 60) + (seconds / 3600);
}

export function parseDate(dateStr?: string): Date | null {
  if (!dateStr || dateStr === "-" || String(dateStr).trim() === "") return null;
  const sDateStr = String(dateStr).trim();
  
  const parts = sDateStr.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10);
    let year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

    month = month - 1;

    if (year >= 0 && year <= 99) {
      year += 2000;
    }

    if (year < 1000 || year > 3000) return null; 

    const date = new Date(year, month, day);
    
    if (isNaN(date.getTime()) || date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
      return null;
    }
    return date;
  } else {
    const genericDate = new Date(sDateStr);
    if (!isNaN(genericDate.getTime())) {
      const genericYear = genericDate.getFullYear();
      if (genericYear > 1900 && genericYear < 3000) {
          return genericDate;
      }
    }
    return null;
  }
}

export function getWeekIdentifier(date?: Date | null): string | null {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return null;
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function normalizeBlingStatus(blingStatus: string): string {
    const s = blingStatus.toLowerCase();
    if (s.includes('atendido')) return 'Finalizado';
    if (s.includes('cancelado')) return 'Descontinuada';
    if (s.includes('andamento')) return 'Em andamento';
    if (s.includes('em aberto') || s.includes('pendente')) return 'Pendente';
    return 'Pendente'; // Default
}

export function processRow(row: Record<string, any>): Task {
  const newRow: Partial<Task> & { [key: string]: any } = {};

  try {
    // Map Bling columns to Task interface
    newRow['ID da tarefa'] = parseInt(String(row['ID']), 10);
    newRow['Tarefa'] = row['Descrição'] || 'Tarefa sem nome';
    newRow['Status'] = row['Situação'] ? normalizeBlingStatus(row['Situação']) : 'N/D';
    newRow['Responsável'] = row['Vendedor'] || 'N/A';
    newRow['Estratégia'] = row['Loja virtual'] || 'N/A';
    newRow['Prioridade'] = row['Prioridade'] ? parseInt(String(row['Prioridade']), 10) : 3; // Default to Baixa
    
    newRow['Data de criação'] = parseDate(String(row['Data']));
    newRow['Prazo'] = null; // Bling default CSV doesn't have a deadline
    newRow['Data de finalização'] = newRow['Status'] === 'Finalizado' ? parseDate(String(row['Data'])) : null; // Assume completion date is order date for 'Atendido'
    newRow['Última atualização'] = newRow['Data de finalização'] || newRow['Data de criação'];


    // Fields not in Bling default export, set to defaults
    newRow['Carga de Trabalho'] = 0;
    newRow['Tempo de Tracking (Horas)'] = 0;
    newRow['Pausada'] = 'Não';
    newRow['Pendente com'] = '';
    newRow['Etapa'] = 'Geral'; // Default Etapa

    // Calculated fields
    newRow.AtrasadaCalculado = !!(newRow.Prazo && newRow.Prazo < HOJE && newRow.Status !== 'Finalizado' && newRow.Status !== 'Descontinuada');

    const seteDiasAtras = new Date(HOJE);
    seteDiasAtras.setDate(HOJE.getDate() - 7);
    newRow.DesatualizadaCalculado = newRow.Status !== 'Finalizado' &&
      newRow.Status !== 'Descontinuada' &&
      String(newRow.Pausada).toLowerCase() !== 'sim' &&
      !!newRow['Última atualização'] &&
      newRow['Última atualização'] < seteDiasAtras;

    newRow.FinalizadaNestaSemanaCalculado = newRow.Status === 'Finalizado' &&
      !!newRow['Data de finalização'] &&
      newRow['Data de finalização'] >= START_OF_CURRENT_WEEK &&
      newRow['Data de finalização'] <= END_OF_CURRENT_WEEK;

    newRow.PrioridadeAltaPendenteCalculado = newRow.Prioridade === 1 &&
      (newRow.Status === 'Pendente' || newRow.Status === 'Em andamento');

    newRow.ComPendenciaExternaCalculado = !!(newRow['Pendente com'] && String(newRow['Pendente com']).trim() !== '');

    newRow.SemanaConclusao = (newRow.Status === 'Finalizado' && newRow['Data de finalização']) ? getWeekIdentifier(newRow['Data de finalização']) : null;
    newRow.SemanaCriacao = newRow['Data de criação'] ? getWeekIdentifier(newRow['Data de criação']) : null;

    newRow.AtivaCalculado = newRow.Status !== 'Finalizado' && newRow.Status !== 'Descontinuada' && String(newRow.Pausada).toLowerCase() !== 'sim';

    return newRow as Task;
  } catch (error) {
    console.error('Erro ao processar linha do Bling:', row, error);
    return { ...newRow, _error: true } as Task;
  }
}
