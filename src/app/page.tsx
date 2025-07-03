
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce';

import { SidebarTrigger, SidebarInset, SidebarRail } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Loader2, Filter, FileWarning, Upload } from 'lucide-react';

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
import AiAnalysis from '@/components/dashboard/AiAnalysis';

import type { Task } from '@/lib/constants';
import { useTaskData, type UseTaskDataReturn } from '@/hooks/use-task-data';


const initialFiltersState: FiltersState = {
  dateRange: undefined,
  responsibles: [],
  statuses: [],
  strategies: [],
  priorities: [],
  paused: 'all',
  waitingOnSomeone: 'all',
};

function DashboardContent({ taskData }: { taskData: UseTaskDataReturn }) {
    const {
        filteredTasks,
        allTasks,
        csvFileName,
        kpiData,
        overallStatusChartData,
        etapaDistributionChartData,
        priorityDistributionChartData,
        weeklyTrendChartData,
        progressByResponsibleData,
        progressByStrategyData,
        isApplyingFilters,
        clearAndReload,
    } = taskData;
  
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalTasks, setModalTasks] = useState<Task[]>([]);

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

    return (
        <>
            <div className="container mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-border/30">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                        Dashboard de Performance
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                        Análise das tarefas do arquivo: <span className="font-semibold text-foreground">{csvFileName}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2 mt-4 sm:mt-0">
                         <Button variant="outline" size="sm" onClick={clearAndReload}>
                            <Upload className="mr-2 h-4 w-4" />
                            Carregar Novo CSV
                        </Button>
                        <SidebarTrigger className="md:hidden">
                          <Filter className="h-5 w-5" />
                        </SidebarTrigger>
                    </div>
                </div>

                {isApplyingFilters ? (
                    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-250px)]">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <p className="text-lg font-medium">Atualizando dados com filtros...</p>
                    </div>
                ) : filteredTasks.length === 0 && allTasks.length > 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-250px)] bg-card p-8 rounded-xl shadow-yav-lg border border-border/20 text-center">
                        <FileWarning className="w-16 h-16 text-amber-500 mb-6" />
                        <h3 className="text-2xl font-semibold text-foreground mb-2">Nenhuma Tarefa Encontrada</h3>
                        <p className="text-muted-foreground max-w-md">Não há tarefas que correspondam aos filtros selecionados. Tente ajustar seus critérios de busca.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <AiAnalysis filteredTasks={filteredTasks} />

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
             <CriticalTaskModal 
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                title={modalTitle}
                tasks={modalTasks}
            />
        </>
    );
}

export default function DashboardPage() {
  const taskData = useTaskData(initialFiltersState);
  const [filters, setFilters] = useState<FiltersState>(initialFiltersState);
  const [debouncedFilters] = useDebounce(filters, 500); // Debounce filter changes

  useEffect(() => {
    taskData.applyFilters(debouncedFilters);
  }, [debouncedFilters, taskData.applyFilters]);

  // Initial load check
  if (taskData.isLoading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-6 text-center container mx-auto">
        <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
        <p className="text-xl font-medium">Carregando dados do dashboard...</p>
        <p className="text-muted-foreground mt-1">Isso pode levar alguns instantes.</p>
      </div>
    );
  }

  // If no data is loaded, show the import screen
  if (!taskData.csvFileName) {
    return <CsvImport onDataLoaded={taskData.handleDataLoaded} />;
  }

  // Main dashboard view
  return (
    <>
      <FiltersSidebar 
        allTasks={taskData.allTasks}
        filters={filters}
        onFiltersChange={setFilters}
      />
      <SidebarRail />
      <SidebarInset className="flex-1 px-4 pb-4 pt-[5.5rem] md:px-6 md:pb-6 md:pt-[6rem] lg:px-8 lg:pb-8 lg:pt-[6.5rem] custom-scrollbar bg-gradient-to-br from-background via-card/10 to-background">
        <DashboardContent taskData={taskData} />
      </SidebarInset>
    </>
  );
}
