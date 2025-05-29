
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown, Search } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import type { Task } from '@/lib/constants';
import { formatDateToDdMmYyyy } from '@/lib/utils';
import { getStatusColor, getPriorityColorClass, getPriorityLabel } from '@/lib/constants';

interface TasksTableProps {
  tasks: Task[];
}

type SortKey = keyof Task | null;
type SortDirection = 'asc' | 'desc';

export default function TasksTable({ tasks }: TasksTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('ID da tarefa');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const searchTermLower = searchTerm.toLowerCase();
      // Include priority label in search
      const priorityLabel = getPriorityLabel(task.Prioridade).toLowerCase();
      return Object.values(task).some(value =>
        String(value).toLowerCase().includes(searchTermLower)
      ) || priorityLabel.includes(searchTermLower);
    });

    if (sortKey) {
      filtered.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        let comparison = 0;
        if (valA === undefined || valA === null) comparison = -1;
        else if (valB === undefined || valB === null) comparison = 1;
        else if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        } else if (valA instanceof Date && valB instanceof Date) {
          comparison = valA.getTime() - valB.getTime();
        } else {
          comparison = String(valA).localeCompare(String(valB));
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }
    return filtered;
  }, [tasks, searchTerm, sortKey, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedTasks.length / itemsPerPage);
  const paginatedTasks = filteredAndSortedTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };
  
  const SortableHeader = ({ children, columnKey }: { children: React.ReactNode, columnKey: SortKey }) => (
    <TableHead onClick={() => handleSort(columnKey)} className="cursor-pointer hover:bg-muted/50">
      <div className="flex items-center">
        {children}
        {sortKey === columnKey && (
          <ArrowUpDown className={`ml-2 h-3 w-3 ${sortDirection === 'asc' ? 'transform rotate-180 text-accent' : 'text-accent'}`} />
        )}
      </div>
    </TableHead>
  );


  return (
    <div className="bg-card p-6 rounded-xl shadow-yav-xl border border-border/20">
      <h3 className="text-xl font-semibold border-b border-border/50 pb-3 mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
        Relatório Detalhado
      </h3>
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        <div className="relative flex-grow max-w-xs">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar no relatório..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-muted-foreground">Linhas por página:</span>
          <Select value={String(itemsPerPage)} onValueChange={(value) => { setItemsPerPage(Number(value)); setCurrentPage(1); }}>
            <SelectTrigger className="w-[70px] h-9 text-xs">
              <SelectValue placeholder={itemsPerPage} />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 25, 50, 100].map(val => (
                <SelectItem key={val} value={String(val)} className="text-xs">{val}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border/30">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader columnKey="ID da tarefa">ID</SortableHeader>
              <SortableHeader columnKey="Tarefa">Tarefa</SortableHeader>
              <SortableHeader columnKey="Estratégia">Estratégia</SortableHeader>
              <SortableHeader columnKey="Responsável">Responsável</SortableHeader>
              <SortableHeader columnKey="Status">Status</SortableHeader>
              <SortableHeader columnKey="Prioridade">Prior.</SortableHeader>
              <SortableHeader columnKey="Data de criação">Criação</SortableHeader>
              <SortableHeader columnKey="Prazo">Prazo</SortableHeader>
              <SortableHeader columnKey="AtrasadaCalculado">Atrasada</SortableHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTasks.length > 0 ? (
              paginatedTasks.map((task) => (
                <TableRow key={task['ID da tarefa']}>
                  <TableCell className="text-xs">{task['ID da tarefa']}</TableCell>
                  <TableCell className="text-xs max-w-xs truncate" title={task['Tarefa'] || 'N/D'}>{task['Tarefa'] || 'N/D'}</TableCell>
                  <TableCell className="text-xs">{task['Estratégia'] || 'N/D'}</TableCell>
                  <TableCell className="text-xs">{task['Responsável'] || 'N/D'}</TableCell>
                  <TableCell className="text-xs">
                    <span className="inline-flex items-center">
                      <svg className="w-2 h-2 mr-2 flex-shrink-0" fill={getStatusColor(task.AtrasadaCalculado && task.Status !== 'Finalizado' ? 'Atrasada' : task.Status)} viewBox="0 0 8 8"><circle cx="4" cy="4" r="4"/></svg>
                      {task.Status || "N/D"}
                    </span>
                  </TableCell>
                  <TableCell className={`text-xs ${getPriorityColorClass(task.Prioridade)}`}>
                    {getPriorityLabel(task.Prioridade)}
                  </TableCell>
                  <TableCell className="text-xs">{formatDateToDdMmYyyy(task['Data de criação'])}</TableCell>
                  <TableCell className="text-xs">{formatDateToDdMmYyyy(task['Prazo'])}</TableCell>
                  <TableCell className={`text-xs ${task.AtrasadaCalculado && task.Status !== 'Finalizado' ? 'text-status-yellow font-semibold' : ''}`}>
                    {task.AtrasadaCalculado && task.Status !== 'Finalizado' ? 'Sim' : 'Não'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  Nenhuma tarefa encontrada com os filtros atuais ou para o termo buscado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {filteredAndSortedTasks.length > 0 && (
             <TableCaption className="mt-2">
               Página {currentPage} de {totalPages}. Total de {filteredAndSortedTasks.length} tarefas.
             </TableCaption>
          )}
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4 text-sm">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <span className="text-muted-foreground">Página {currentPage} de {totalPages}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
