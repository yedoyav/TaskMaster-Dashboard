
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

export function processRow(row: Record<string, any>): Task {
  const newRow: Partial<Task> & { [key: string]: any } = {};

  try {
    // Map CSV columns to Task interface, with type parsing
    newRow['ID da tarefa'] = parseInt(String(row['ID da tarefa']), 10);
    newRow['Tarefa'] = row['Tarefa'] || 'Tarefa sem nome';
    newRow['Status'] = row['Status'] || 'N/D';
    newRow['Responsável'] = row['Responsável'] || 'N/A';
    newRow['Estratégia'] = row['Estratégia'] || 'N/A';
    
    // Handle 'Descontinuada' column to override status
    if (String(row['Descontinuada']).toLowerCase() === 'sim') {
        newRow['Status'] = 'Descontinuada';
    }
    
    const priority = parseInt(String(row['Prioridade']), 10);
    newRow['Prioridade'] = isNaN(priority) ? undefined : priority;
    
    const carga = parseFloat(String(row['Carga de Trabalho']).replace(',', '.'));
    newRow['Carga de Trabalho'] = isNaN(carga) ? 0 : carga;

    newRow['Data de criação'] = parseDate(String(row['Data de criação']));
    newRow['Última atualização'] = parseDate(String(row['Última atualização']));
    newRow['Data de início'] = parseDate(String(row['Data de início']));
    newRow['Prazo'] = parseDate(String(row['Prazo']));
    newRow['Data de finalização'] = parseDate(String(row['Data de finalização']));

    newRow['Tempo de Tracking'] = row['Tempo de Tracking'];
    newRow['Tempo de Tracking (Horas)'] = convertTrackingTimeToHours(row['Tempo de Tracking']);
    
    newRow['Pausada'] = row['Pausada'] || 'Não';
    newRow['Pendente com'] = row['Pendente com'] || '';
    newRow['Etapa'] = row['Etapa'] || 'Não definida';
    newRow['urlApp'] = row['urlApp'];
    newRow['urlCliente'] = row['urlCliente'];

    // Check for required fields after mapping
    if (isNaN(newRow['ID da tarefa'])) {
        console.error('ID da tarefa inválido ou ausente:', row);
        return { ...newRow, _error: true } as Task;
    }

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
    console.error('Erro ao processar linha do CSV:', row, error);
    return { ...newRow, _error: true } as Task;
  }
}
