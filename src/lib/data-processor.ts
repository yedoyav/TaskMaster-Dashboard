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
  const parts = String(dateStr).split('/');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Mês é 0-indexado
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year) || year < 1000 || year > 3000) return null;
  const date = new Date(year, month, day);
  // Check if date is valid and components match, to avoid issues like 31/04 becoming 01/05
  if (isNaN(date.getTime()) || date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }
  return date;
}

export function getWeekIdentifier(date?: Date | null): string | null {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return null;
  // Create a new Date object to avoid modifying the original date
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  // Return YYYY-Www
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function processRow(row: Record<string, any>): Task {
  const newRow: Task = { ...row } as Task;

  try {
    newRow['ID da tarefa'] = parseInt(String(newRow['ID da tarefa']), 10);
    newRow['Carga de Trabalho'] = parseFloat(String(newRow['Carga de Trabalho'] || '0').replace(',', '.'));
    newRow['Prioridade'] = newRow['Prioridade'] ? parseInt(String(newRow['Prioridade']), 10) : undefined;

    newRow['Data de criação'] = parseDate(String(newRow['Data de criação']));
    newRow['Última atualização'] = parseDate(String(newRow['Última atualização']));
    newRow['Data de início'] = parseDate(String(newRow['Data de início']));
    newRow['Prazo'] = parseDate(String(newRow['Prazo']));
    newRow['Data de finalização'] = parseDate(String(newRow['Data de finalização']));

    newRow['Tempo de Tracking (Horas)'] = convertTrackingTimeToHours(newRow['Tempo de Tracking']);

    if (newRow['Status'] && typeof newRow['Status'] === 'string') {
      const trimmedStatus = String(newRow['Status']).trim();
      if (trimmedStatus === '') {
        newRow['Status'] = 'N/D';
      } else {
        newRow['Status'] = trimmedStatus.charAt(0).toUpperCase() + trimmedStatus.slice(1).toLowerCase();
      }
    } else if (!newRow['Status'] || String(newRow['Status']).trim() === '') {
      newRow['Status'] = 'N/D';
    }
    
    newRow.AtrasadaCalculado = !!(newRow['Prazo'] && newRow['Prazo'] < HOJE && newRow['Status'] !== 'Finalizado' && newRow['Status'] !== 'Descontinuada');

    const seteDiasAtras = new Date(HOJE);
    seteDiasAtras.setDate(HOJE.getDate() - 7);
    newRow.DesatualizadaCalculado = newRow['Status'] !== 'Finalizado' &&
      newRow['Status'] !== 'Descontinuada' &&
      String(newRow['Pausada']).toLowerCase() !== 'sim' &&
      !!newRow['Última atualização'] &&
      newRow['Última atualização'] < seteDiasAtras;

    newRow.FinalizadaNestaSemanaCalculado = newRow['Status'] === 'Finalizado' &&
      !!newRow['Data de finalização'] &&
      newRow['Data de finalização'] >= START_OF_CURRENT_WEEK &&
      newRow['Data de finalização'] <= END_OF_CURRENT_WEEK;

    newRow.PrioridadeAltaPendenteCalculado = newRow['Prioridade'] === 1 &&
      (newRow['Status'] === 'Pendente' || newRow['Status'] === 'Em andamento');

    newRow.ComPendenciaExternaCalculado = !!(newRow['Pendente com'] && String(newRow['Pendente com']).trim() !== '');

    newRow.SemanaConclusao = (newRow['Status'] === 'Finalizado' && newRow['Data de finalização']) ? getWeekIdentifier(newRow['Data de finalização']) : null;
    newRow.SemanaCriacao = newRow['Data de criação'] ? getWeekIdentifier(newRow['Data de criação']) : null;

    newRow.AtivaCalculado = newRow['Status'] !== 'Finalizado' && newRow['Status'] !== 'Descontinuada' && String(newRow['Pausada']).toLowerCase() !== 'sim';

    return newRow;
  } catch (error) {
    console.error('Erro ao processar linha:', row, error);
    newRow._error = true;
    return newRow;
  }
}
