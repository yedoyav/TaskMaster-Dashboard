
import type { Task } from './constants';
import { HOJE } from './constants';
import { formatDistanceStrict } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface KpiValues {
  totalTasks: number;
  activeTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  completedThisWeek: number;
  overdueTasks: number;
  outdatedTasks: number;
  highPriorityPendingTasks: number;
  pendingExternalTasks: number;
  clientActiveTime: string; // Added for client active time
}

export function calculateKpiValues(tasks: Task[]): KpiValues {
  let clientActiveTimeDisplay = "N/D";

  if (tasks && tasks.length > 0) {
    const creationDates = tasks
      .map(t => t['Data de criação'])
      .filter(date => date instanceof Date && !isNaN(date.getTime())) as Date[];

    if (creationDates.length > 0) {
      const minCreationDate = new Date(Math.min(...creationDates.map(date => date.getTime())));
      clientActiveTimeDisplay = formatDistanceStrict(HOJE, minCreationDate, { locale: ptBR, addSuffix: false });
    }
  }
  
  if (!tasks) {
    return {
      totalTasks: 0,
      activeTasks: 0,
      pendingTasks: 0,
      inProgressTasks: 0,
      completedTasks: 0,
      completedThisWeek: 0,
      overdueTasks: 0,
      outdatedTasks: 0,
      highPriorityPendingTasks: 0,
      pendingExternalTasks: 0,
      clientActiveTime: "N/D",
    };
  }

  return {
    totalTasks: tasks.length,
    activeTasks: tasks.filter(t => t.AtivaCalculado).length,
    pendingTasks: tasks.filter(t => t.Status === 'Pendente').length,
    inProgressTasks: tasks.filter(t => t.Status === 'Em andamento').length,
    completedTasks: tasks.filter(t => t.Status === 'Finalizado').length,
    completedThisWeek: tasks.filter(t => t.FinalizadaNestaSemanaCalculado).length,
    overdueTasks: tasks.filter(t => t.AtrasadaCalculado && t.Status !== 'Finalizado').length,
    outdatedTasks: tasks.filter(t => t.DesatualizadaCalculado).length,
    highPriorityPendingTasks: tasks.filter(t => t.PrioridadeAltaPendenteCalculado).length,
    pendingExternalTasks: tasks.filter(t => t.ComPendenciaExternaCalculado && t.Status !== 'Finalizado' && t.Status !== 'Descontinuada').length,
    clientActiveTime: clientActiveTimeDisplay,
  };
}
