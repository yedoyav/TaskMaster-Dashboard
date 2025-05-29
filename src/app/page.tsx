
"use client";

import { useState, useEffect, useCallback } from 'react';
import { SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Loader2, Filter, FileWarning, LayoutGrid } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

import CsvImport from '@/components/dashboard/CsvImport';
import FiltersSidebar, { type FiltersState } from '@/components/dashboard/FiltersSidebar';
import KpiDashboard, { type CriticalDataType } from '@/components/dashboard/KpiDashboard';
import OverallStatusGaugeChart from '@/components/dashboard/OverallStatusGaugeChart';
import EtapaDistributionChart from '@/components/dashboard/EtapaDistributionChart';
import WeeklyConclusionTrendChart from '@/components/dashboard/WeeklyConclusionTrendChart';
import ProgressList from '@/components/dashboard/ProgressList';
import TasksTable from '@/components/dashboard/TasksTable';
import CriticalTaskModal from '@/components/dashboard/CriticalTaskModal';
import PriorityDistributionChart from '@/components/dashboard/PriorityDistributionChart';

import type { Task } from '@/lib/constants';
import { calculateKpiValues, type KpiValues } from '@/lib/kpi-utils';
import { 
  processOverallStatusData, 
  processEtapaDistributionData, 
  processWeeklyTrendData, 
  processProgressListData,
  processPriorityDistributionData,
  type OverallStatusProcessedData,
  type EtapaDistributionChartData,
  type WeeklyTrendChartData,
  type ProgressListItem,
  type PriorityDistributionChartData
} from '@/lib/chart-utils';
import type { DateRange } from 'react-day-picker';

const initialFiltersState: FiltersState = {
  dateRange: undefined,
  responsibles: [],
  statuses: [],
  strategies: [],
  priorities: [],
  paused: 'all',
  waitingOnSomeone: 'all',
};

export default function DashboardPage() {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const [isLoadingCsv, setIsLoadingCsv] = useState(false);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);

  const [currentFilters, setCurrentFilters] = useState<FiltersState>(initialFiltersState);

  const [kpiData, setKpiData] = useState<KpiValues>(calculateKpiValues([]));
  const [overallStatusChartData, setOverallStatusChartData] = useState<OverallStatusProcessedData>(processOverallStatusData([]));
  const [etapaDistributionChartData, setEtapaDistributionChartData] = useState<EtapaDistributionChartData>(processEtapaDistributionData([]));
  const [priorityDistributionChartData, setPriorityDistributionChartData] = useState<PriorityDistributionChartData>(processPriorityDistributionData([]));
  const [weeklyTrendChartData, setWeeklyTrendChartData] = useState<WeeklyTrendChartData>(processWeeklyTrendData([]));
  const [progressByResponsibleData, setProgressByResponsibleData] = useState<ProgressListItem[]>([]);
  const [progressByStrategyData, setProgressByStrategyData] = useState<ProgressListItem[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalTasks, setModalTasks] = useState<Task[]>([]);

  const { toast } = useToast();

  const applyFilters = useCallback((filtersToApply: FiltersState) => {
    setIsLoadingFilters(true);
    setCurrentFilters(filtersToApply);

    // Simulate API call delay for filter application
    setTimeout(() => {
      let tempFilteredTasks = [...allTasks];

      if (filtersToApply.dateRange?.from && allTasks.length > 0) {
        tempFilteredTasks = tempFilteredTasks.filter(task => {
          if (!task['Data de criação']) return false;
          const taskDate = new Date(task['Data de criação']);
          taskDate.setHours(0,0,0,0);
          
          const fromDate = new Date(filtersToApply.dateRange!.from!);
          fromDate.setHours(0,0,0,0);

          if (!filtersToApply.dateRange!.to) {
            return taskDate.getTime() === fromDate.getTime();
          }
          
          const toDate = new Date(filtersToApply.dateRange!.to);
          toDate.setHours(23,59,59,999);

          return taskDate >= fromDate && taskDate <= toDate;
        });
      }
      
      if (filtersToApply.responsibles.length > 0) {
        tempFilteredTasks = tempFilteredTasks.filter(task => filtersToApply.responsibles.includes(task['Responsável'] || ''));
      }
      if (filtersToApply.statuses.length > 0) {
        tempFilteredTasks = tempFilteredTasks.filter(task => filtersToApply.statuses.includes(task.Status || ''));
      }
      if (filtersToApply.strategies.length > 0) {
        tempFilteredTasks = tempFilteredTasks.filter(task => filtersToApply.strategies.includes(task['Estratégia'] || ''));
      }
      if (filtersToApply.priorities.length > 0) {
        tempFilteredTasks = tempFilteredTasks.filter(task => filtersToApply.priorities.includes(String(task.Prioridade)));
      }
      if (filtersToApply.paused !== 'all') {
        tempFilteredTasks = tempFilteredTasks.filter(task => (String(task.Pausada).toLowerCase() === filtersToApply.paused));
      }
      if (filtersToApply.waitingOnSomeone !== 'all') {
        tempFilteredTasks = tempFilteredTasks.filter(task => {
          return (filtersToApply.waitingOnSomeone === 'yes' && task.ComPendenciaExternaCalculado) ||
                 (filtersToApply.waitingOnSomeone === 'no' && !task.ComPendenciaExternaCalculado);
        });
      }

      setFilteredTasks(tempFilteredTasks);
      setIsLoadingFilters(false);
      toast({ 
        title: "Filtros Aplicados", 
        description: `${tempFilteredTasks.length} tarefas encontradas.`,
        variant: tempFilteredTasks.length === 0 && allTasks.length > 0 ? "destructive" : "default" 
      });
    }, 300);
  }, [allTasks, toast]);

  useEffect(() => {
    setKpiData(calculateKpiValues(filteredTasks));
    setOverallStatusChartData(processOverallStatusData(filteredTasks));
    setEtapaDistributionChartData(processEtapaDistributionData(filteredTasks));
    setPriorityDistributionChartData(processPriorityDistributionData(filteredTasks));
    setProgressByResponsibleData(processProgressListData(filteredTasks, 'Responsável'));
    setProgressByStrategyData(processProgressListData(filteredTasks, 'Estratégia'));
    setWeeklyTrendChartData(processWeeklyTrendData(allTasks)); 
  }, [filteredTasks, allTasks]);

  const handleDataLoaded = (data: Task[], fileName: string) => {
    setAllTasks(data);
    setFilteredTasks(data); // Initially, filtered tasks are all tasks
    setCsvFileName(fileName);
    setCurrentFilters(initialFiltersState); // Reset filters on new data load
    toast({ title: "CSV Carregado com Sucesso!", description: `${data.length} tarefas importadas de ${fileName}.`, duration: 5000 });
  };
  
  const handleClearFilters = () => {
    setCurrentFilters(initialFiltersState);
    setFilteredTasks([...allTasks]); // Reset to all tasks
    toast({ title: "Filtros Limpos", description: "Exibindo todas as tarefas." });
  };

  const handleCriticalCardClick = (type: CriticalDataType) => {
    let tasksToList: Task[] = [];
    let title = '';

    switch (type) {
      case 'atrasadas':
        tasksToList = filteredTasks.filter(r => r.AtrasadaCalculado && r.Status !== 'Finalizado');
        title = 'Tarefas Atrasadas';
        break;
      case 'desatualizadas':
        tasksToList = filteredTasks.filter(r => r.DesatualizadaCalculado);
        title = 'Tarefas Desatualizadas (>7 dias)';
        break;
      case 'prioridadeAltaPendente':
        tasksToList = filteredTasks.filter(r => r.PrioridadeAltaPendenteCalculado);
        title = 'Prioridade Alta (Pendente/Em Andamento)';
        break;
      case 'pendenteComAlguem':
        tasksToList = filteredTasks.filter(r => r.ComPendenciaExternaCalculado && r.Status !== 'Finalizado' && r.Status !== 'Descontinuada');
        title = 'Tarefas Pendentes Com Terceiros (Ativas)';
        break;
    }
    setModalTasks(tasksToList);
    setModalTitle(title);
    setIsModalOpen(true);
  };

  if (!csvFileName && !isLoadingCsv) {
    return <CsvImport onDataLoaded={handleDataLoaded} onLoadingChange={setIsLoadingCsv} />;
  }
  
  if (isLoadingCsv && !csvFileName) { // Show loading only if CSV is not yet loaded
     return (
      <div className="flex-grow flex flex-col items-center justify-center p-6 text-center container mx-auto">
        <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
        <p className="text-xl font-medium">Analisando seu arquivo CSV...</p>
        <p className="text-muted-foreground mt-1">Isso pode levar alguns instantes.</p>
      </div>
    );
  }

  return (
    <>
      <FiltersSidebar 
        allTasks={allTasks} 
        onApplyFilters={applyFilters} 
        onClearFilters={handleClearFilters}
        initialFilters={currentFilters}
      />
      <SidebarInset className="flex-1 p-4 md:p-6 lg:p-8 custom-scrollbar bg-gradient-to-br from-background via-card/10 to-background">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-border/30">
            <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Dashboard de Performance
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                Análise das tarefas do arquivo: <span className="font-semibold text-foreground">{csvFileName}</span>
                </p>
            </div>
            <SidebarTrigger className="md:hidden mt-4 sm:mt-0">
              <Filter className="h-5 w-5" />
            </SidebarTrigger>
          </div>

          {isLoadingFilters ? (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-250px)]">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-lg font-medium">Atualizando dados com filtros...</p>
            </div>
          ) : filteredTasks.length === 0 && allTasks.length > 0 ? (
             <div className="flex flex-col items-center justify-center min-h-[calc(100vh-250px)] bg-card p-8 rounded-xl shadow-yav-lg border border-border/20 text-center">
                <FileWarning className="w-16 h-16 text-amber-500 mb-6" />
                <h3 className="text-2xl font-semibold text-foreground mb-2">Nenhuma Tarefa Encontrada</h3>
                <p className="text-muted-foreground max-w-md">Não há tarefas que correspondam aos filtros selecionados. Tente ajustar seus critérios de busca ou limpar os filtros.</p>
                <Button onClick={handleClearFilters} variant="outline" className="mt-8">
                  <Filter className="mr-2 h-4 w-4" />
                  Limpar Todos os Filtros
                </Button>
            </div>
          ) : (
            <div className="space-y-8">
              <KpiDashboard kpiData={kpiData} onCriticalCardClick={handleCriticalCardClick} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8">
                <OverallStatusGaugeChart data={overallStatusChartData} />
                <PriorityDistributionChart data={priorityDistributionChartData} /> 
                <EtapaDistributionChart data={etapaDistributionChartData} />
                <WeeklyConclusionTrendChart data={weeklyTrendChartData} />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8">
                <ProgressList title="Progresso por Responsável" items={progressByResponsibleData} />
                <ProgressList title="Progresso por Estratégia" items={progressByStrategyData} />
              </div>
              
              <TasksTable tasks={filteredTasks} />
            </div>
          )}
        </div>
      </SidebarInset>
      <CriticalTaskModal 
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={modalTitle}
        tasks={modalTasks}
      />
    </>
  );
}
