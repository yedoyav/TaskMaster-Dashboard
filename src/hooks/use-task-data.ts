
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import type { Task } from '@/lib/constants';
import type { FiltersState } from '@/components/dashboard/FiltersSidebar';

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

const LOCAL_STORAGE_KEY = 'taskMasterData';

export interface UseTaskDataReturn {
    allTasks: Task[];
    filteredTasks: Task[];
    csvFileName: string | null;
    isLoading: boolean;
    isApplyingFilters: boolean;
    handleDataLoaded: (data: Task[], fileName: string) => void;
    clearAndReload: () => void;
    applyFilters: (filters: FiltersState) => void;
    kpiData: KpiValues;
    overallStatusChartData: OverallStatusProcessedData;
    etapaDistributionChartData: EtapaDistributionChartData;
    priorityDistributionChartData: PriorityDistributionChartData;
    weeklyTrendChartData: WeeklyTrendChartData;
    progressByResponsibleData: ProgressListItem[];
    progressByStrategyData: ProgressListItem[];
}


export function useTaskData(initialFilters: FiltersState): UseTaskDataReturn {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const { tasks, fileName } = JSON.parse(savedData);
        // Dates need to be revived from strings
        const revivedTasks = tasks.map((task: any) => ({
            ...task,
            'Data de criação': task['Data de criação'] ? new Date(task['Data de criação']) : null,
            'Prazo': task['Prazo'] ? new Date(task['Prazo']) : null,
            'Última atualização': task['Última atualização'] ? new Date(task['Última atualização']) : null,
            'Data de início': task['Data de início'] ? new Date(task['Data de início']) : null,
            'Data de finalização': task['Data de finalização'] ? new Date(task['Data de finalização']) : null,
        }));
        setAllTasks(revivedTasks);
        setFilteredTasks(revivedTasks);
        setCsvFileName(fileName);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDataLoaded = (data: Task[], fileName: string) => {
    setAllTasks(data);
    setFilteredTasks(data);
    setCsvFileName(fileName);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ tasks: data, fileName }));
      toast({ title: "CSV Carregado com Sucesso!", description: `${data.length} tarefas importadas de ${fileName} e salvas localmente.` });
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
      toast({ variant: 'destructive', title: "Erro ao salvar localmente", description: "Os dados não serão mantidos ao recarregar a página." });
    }
  };

  const clearAndReload = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setAllTasks([]);
    setFilteredTasks([]);
    setCsvFileName(null);
    toast({ title: "Dados limpos", description: "Você pode carregar um novo arquivo CSV." });
  };

  const applyFilters = useCallback((filtersToApply: FiltersState) => {
    setIsApplyingFilters(true);
    // Use a short timeout to allow the UI to show the loading state
    setTimeout(() => {
        let tempFilteredTasks = [...allTasks];
        if (filtersToApply.dateRange?.from && allTasks.length > 0) {
            // ... filtering logic ...
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
        if (filtersToApply.responsibles.length > 0) tempFilteredTasks = tempFilteredTasks.filter(task => filtersToApply.responsibles.includes(task['Responsável'] || ''));
        if (filtersToApply.statuses.length > 0) tempFilteredTasks = tempFilteredTasks.filter(task => filtersToApply.statuses.includes(task.Status || ''));
        if (filtersToApply.strategies.length > 0) tempFilteredTasks = tempFilteredTasks.filter(task => filtersToApply.strategies.includes(task['Estratégia'] || ''));
        if (filtersToApply.priorities.length > 0) tempFilteredTasks = tempFilteredTasks.filter(task => filtersToApply.priorities.includes(String(task.Prioridade)));
        if (filtersToApply.paused !== 'all') tempFilteredTasks = tempFilteredTasks.filter(task => (String(task.Pausada).toLowerCase() === filtersToApply.paused.toLowerCase()));
        if (filtersToApply.waitingOnSomeone !== 'all') tempFilteredTasks = tempFilteredTasks.filter(task => ((filtersToApply.waitingOnSomeone === 'yes' && task.ComPendenciaExternaCalculado) || (filtersToApply.waitingOnSomeone === 'no' && !task.ComPendenciaExternaCalculado)));

        setFilteredTasks(tempFilteredTasks);
        setIsApplyingFilters(false);
    }, 100);
  }, [allTasks]);


  // Memoize chart and KPI data so they are only recalculated when filteredTasks changes
  const kpiData = useMemo(() => calculateKpiValues(filteredTasks), [filteredTasks]);
  const overallStatusChartData = useMemo(() => processOverallStatusData(filteredTasks), [filteredTasks]);
  const etapaDistributionChartData = useMemo(() => processEtapaDistributionData(filteredTasks), [filteredTasks]);
  const priorityDistributionChartData = useMemo(() => processPriorityDistributionData(filteredTasks), [filteredTasks]);
  const progressByResponsibleData = useMemo(() => processProgressListData(filteredTasks, 'Responsável'), [filteredTasks]);
  const progressByStrategyData = useMemo(() => processProgressListData(filteredTasks, 'Estratégia'), [filteredTasks]);
  // Weekly trend should be based on all tasks, not filtered tasks
  const weeklyTrendChartData = useMemo(() => processWeeklyTrendData(allTasks), [allTasks]);


  return {
    allTasks,
    filteredTasks,
    csvFileName,
    isLoading,
    isApplyingFilters,
    handleDataLoaded,
    clearAndReload,
    applyFilters,
    kpiData,
    overallStatusChartData,
    etapaDistributionChartData,
    priorityDistributionChartData,
    weeklyTrendChartData,
    progressByResponsibleData,
    progressByStrategyData
  };
}
