import type { Task } from './constants';

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
}

export function calculateKpiValues(tasks: Task[]): KpiValues {
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
  };
}
