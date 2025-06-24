
import KpiCard from './KpiCard';
import CriticalKpiCard from './CriticalKpiCard';
import {
  ClipboardList, ListTodo, Clock3, Loader2, CheckCircle2, CalendarCheck2, AlertOctagon, ShieldAlert, Users, TrendingUp, CalendarClock
} from 'lucide-react';
import type { KpiValues } from '@/lib/kpi-utils';

interface KpiDashboardProps {
  kpiData: KpiValues;
  onCriticalCardClick: (type: CriticalDataType) => void;
}

export type CriticalDataType = 'atrasadas' | 'desatualizadas' | 'prioridadeAltaPendente' | 'pendenteComAlguem';

export default function KpiDashboard({ kpiData, onCriticalCardClick }: KpiDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Main KPI Cards - Now a single responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <KpiCard 
          title="Total de Tarefas" 
          value={kpiData.totalTasks} 
          icon={ClipboardList} 
          iconColorClass="text-primary"
          borderColorClass="border-primary"
        />
        <KpiCard 
          title="Tarefas Ativas" 
          value={kpiData.activeTasks} 
          icon={ListTodo} 
          iconColorClass="text-chart-3"
          valueColorClass="text-chart-3"
          borderColorClass="border-chart-3"
        />
        <KpiCard 
          title="Tarefas Pendentes" 
          value={kpiData.pendingTasks} 
          icon={Clock3} 
          iconColorClass="text-chart-1"
          valueColorClass="text-chart-1"
          borderColorClass="border-chart-1"
        />
        <KpiCard 
          title="Em Andamento" 
          value={kpiData.inProgressTasks} 
          icon={Loader2} 
          iconColorClass="text-accent"
          valueColorClass="text-accent"
          borderColorClass="border-accent"
        />
        <KpiCard 
          title="Concluídas (Total)" 
          value={kpiData.completedTasks} 
          icon={CheckCircle2} 
          iconColorClass="text-status-green"
          valueColorClass="text-status-green"
          borderColorClass="border-status-green"
        />
        <KpiCard 
          title="Concluídas (Semana)" 
          value={kpiData.completedThisWeek} 
          icon={CalendarCheck2} 
          iconColorClass="text-status-green"
          valueColorClass="text-status-green"
          borderColorClass="border-status-green"
        />
        <KpiCard
          title="Tempo Cliente Ativo"
          value={kpiData.clientActiveTime}
          icon={CalendarClock}
          iconColorClass="text-chart-3"
          valueColorClass="text-chart-3"
          borderColorClass="border-chart-3"
          description="Desde a 1ª tarefa"
        />

        {/* Critical KPIs integrated into the same grid but styled differently */}
        <CriticalKpiCard 
          title="Atrasadas" 
          value={kpiData.overdueTasks} 
          icon={AlertOctagon}
          onClick={() => onCriticalCardClick('atrasadas')}
          cardColorClass="bg-status-red/10 border-status-red"
          textColorClass="text-status-red"
          iconColorClass="text-white bg-status-red/80 p-1 rounded"
          description="Tarefas após o prazo"
        />
        <CriticalKpiCard 
          title="Desatualizadas" 
          value={kpiData.outdatedTasks}
          icon={ShieldAlert}
          onClick={() => onCriticalCardClick('desatualizadas')}
          cardColorClass="bg-status-yellow/10 border-status-yellow"
          textColorClass="text-status-yellow"
          iconColorClass="text-black bg-status-yellow/80 p-1 rounded"
          description="Sem atualização >7 dias"
        />
        <CriticalKpiCard 
          title="Prior. Alta Pendente" 
          value={kpiData.highPriorityPendingTasks}
          icon={TrendingUp}
          onClick={() => onCriticalCardClick('prioridadeAltaPendente')}
          cardColorClass="bg-primary/10 border-primary"
          textColorClass="text-primary"
          iconColorClass="text-white bg-primary/80 p-1 rounded"
          description="Alta prioridade pendente ou em andamento"
        />
        <CriticalKpiCard 
          title="Pendente Terceiros" 
          value={kpiData.pendingExternalTasks}
          icon={Users}
          onClick={() => onCriticalCardClick('pendenteComAlguem')}
          cardColorClass="bg-status-blue/10 border-status-blue"
          textColorClass="text-status-blue"
          iconColorClass="text-white bg-status-blue/80 p-1 rounded"
          description="Aguardando resposta externa"
        />
      </div>
    </div>
  );
}
