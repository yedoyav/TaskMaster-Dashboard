import KpiCard from './KpiCard';
import CriticalKpiCard from './CriticalKpiCard';
import {
  ClipboardList, ListTodo, Clock3, Loader2, CheckCircle2, CalendarCheck2, AlertOctagon, ShieldAlert, Users, TrendingUp
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
          iconColorClass="text-yav-cyan"
          valueColorClass="text-yav-cyan"
          borderColorClass="border-yav-cyan"
        />
        <KpiCard 
          title="Tarefas Pendentes" 
          value={kpiData.pendingTasks} 
          icon={Clock3} 
          iconColorClass="text-yav-purple"
          valueColorClass="text-yav-purple"
          borderColorClass="border-yav-purple"
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
          cardColorClass="bg-yav-purple/10 border-yav-purple"
          textColorClass="text-yav-purple"
          iconColorClass="text-white bg-yav-purple/80 p-1 rounded"
          description="Alta prioridade não iniciada"
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
