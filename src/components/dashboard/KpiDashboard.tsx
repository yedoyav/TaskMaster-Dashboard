import KpiCard from './KpiCard';
import CriticalKpiCard from './CriticalKpiCard';
import {
  ClipboardList, ListTodo, Clock3, Loader2, CheckCircle2, CalendarCheck2, AlertOctagon, RefreshCcw,ShieldAlert, Users
} from 'lucide-react';
import type { KpiValues } from '@/lib/kpi-utils';

interface KpiDashboardProps {
  kpiData: KpiValues;
  onCriticalCardClick: (type: CriticalDataType) => void;
}

export type CriticalDataType = 'atrasadas' | 'desatualizadas' | 'prioridadeAltaPendente' | 'pendenteComAlguem';

export default function KpiDashboard({ kpiData, onCriticalCardClick }: KpiDashboardProps) {
  return (
    <>
      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        <KpiCard title="Total Tarefas" value={kpiData.totalTasks} icon={ClipboardList} borderColorClass="border-yav-cyan" iconColorClass="text-yav-cyan" />
        <KpiCard title="Ativas" value={kpiData.activeTasks} icon={ListTodo} borderColorClass="border-status-blue" iconColorClass="text-status-blue" valueColorClass="text-status-blue" />
        <KpiCard title="Pendentes" value={kpiData.pendingTasks} icon={Clock3} borderColorClass="border-yav-purple" iconColorClass="text-yav-purple" valueColorClass="text-yav-purple" />
        <KpiCard title="Em Andamento" value={kpiData.inProgressTasks} icon={Loader2} borderColorClass="border-yav-cyan" iconColorClass="text-yav-cyan" valueColorClass="text-yav-cyan" />
        <KpiCard title="Concluídas" value={kpiData.completedTasks} icon={CheckCircle2} borderColorClass="border-status-green" iconColorClass="text-status-green" valueColorClass="text-status-green"/>
        <KpiCard title="Concluídas na Semana" value={kpiData.completedThisWeek} icon={CalendarCheck2} borderColorClass="border-status-green" iconColorClass="text-status-green" valueColorClass="text-status-green"/>
      </div>

      {/* Critical Attention Cards */}
      <div className="bg-card p-6 rounded-xl shadow-yav-xl border border-border/20 mb-8">
        <h3 className="text-xl font-semibold border-b border-border/50 pb-3 mb-5 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Atenção Crítica</h3>
        <p className="text-sm text-muted-foreground mb-5">Clique para ver detalhes.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <CriticalKpiCard 
            title="Atrasadas" 
            value={kpiData.overdueTasks} 
            onClick={() => onCriticalCardClick('atrasadas')}
            borderColorClass="border-status-red"
            valueColorClass="text-status-red"
          />
          <CriticalKpiCard 
            title="Desatualizadas" 
            value={kpiData.outdatedTasks}
            onClick={() => onCriticalCardClick('desatualizadas')}
            borderColorClass="border-status-yellow"
            valueColorClass="text-status-yellow"
          />
          <CriticalKpiCard 
            title="Prior. Alta Pendente" 
            value={kpiData.highPriorityPendingTasks}
            onClick={() => onCriticalCardClick('prioridadeAltaPendente')}
            borderColorClass="border-yav-purple" // Using yav-purple for high priority
            valueColorClass="text-yav-purple"
          />
          <CriticalKpiCard 
            title="Pendente Terceiros" 
            value={kpiData.pendingExternalTasks}
            onClick={() => onCriticalCardClick('pendenteComAlguem')}
            borderColorClass="border-status-blue"
            valueColorClass="text-status-blue"
          />
        </div>
      </div>
    </>
  );
}
