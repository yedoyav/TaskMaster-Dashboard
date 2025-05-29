
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

    // Ajusta o mês para ser 0-indexado para o construtor Date
    month = month - 1;

    // Lida com anos de 2 dígitos, assume 20xx
    if (year >= 0 && year <= 99) {
      year += 2000;
    }

    // Checagem básica de sanidade para o ano de 4 dígitos após o ajuste
    if (year < 1000 || year > 3000) return null; 

    const date = new Date(year, month, day);
    
    // Verifica se a data é válida e se os componentes correspondem
    if (isNaN(date.getTime()) || date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
      return null;
    }
    return date;
  } else {
    // Se não for dd/MM/yyyy ou dd/MM/yy, tenta um parse mais genérico (ex: ISO)
    const genericDate = new Date(sDateStr);
    if (!isNaN(genericDate.getTime())) {
      // Verifica se o ano é razoável para evitar datas como "01-02-03" sendo interpretadas como ano 3.
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
  // Cria um novo objeto Date para evitar modificar a data original
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Define para a quinta-feira mais próxima: data atual + 4 - número do dia atual
  // Faz o número do dia do domingo ser 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Pega o primeiro dia do ano
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calcula semanas completas até a quinta-feira mais próxima
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  // Retorna YYYY-Www
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
