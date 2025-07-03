
"use client";

import { useState, useEffect } from 'react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Check, ChevronsUpDown, FilterX, RotateCcw } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Select as ShadcnSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn, getUniqueValues } from '@/lib/utils';
import type { Task } from '@/lib/constants';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';

export interface FiltersState {
  dateRange?: DateRange;
  responsibles: string[];
  statuses: string[];
  strategies: string[];
  priorities: string[];
  paused: string;
  waitingOnSomeone: string;
}

interface FiltersSidebarProps {
  allTasks: Task[];
  filters: FiltersState;
  onFiltersChange: (filters: FiltersState) => void;
}

// MultiSelect component
interface MultiSelectOption { value: string; label: string; }
interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  label: string;
}

function MultiSelect({ options, selected, onChange, placeholder = "Selecione...", className, id, label }: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter(item => item !== value)
      : [...selected, value];
    onChange(newSelected);
  };
  
  const displayValue = selected.length > 0 
    ? selected.length === 1 
      ? options.find(opt => opt.value === selected[0])?.label 
      : `${selected.length} selecionados`
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Label htmlFor={id} className="block text-xs font-medium text-muted-foreground mb-1.5">{label}:</Label>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between text-xs h-9 font-normal", className, selected.length > 0 ? "text-foreground" : "text-muted-foreground")}
        >
          <span className="truncate">{displayValue}</span>
          <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Buscar..." className="h-8 text-xs" />
          <CommandList>
            <CommandEmpty>Nenhum item encontrado.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    handleSelect(option.value);
                  }}
                  className="text-xs"
                >
                  <Check
                    className={cn(
                      "mr-2 h-3 w-3",
                      selected.includes(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}


export default function FiltersSidebar({ allTasks, filters, onFiltersChange }: FiltersSidebarProps) {

  const handleFilterChange = <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };
  
  const handleDateRangeChange = (dateRange?: DateRange) => {
    handleFilterChange('dateRange', dateRange);
  };

  const handleClear = () => {
    onFiltersChange({
      dateRange: undefined,
      responsibles: [],
      statuses: [],
      strategies: [],
      priorities: [],
      paused: 'all',
      waitingOnSomeone: 'all',
    });
  };

  const responsibleOptions = getUniqueValues(allTasks, 'Responsável').map(val => ({ value: val, label: val }));
  const statusOptions = getUniqueValues(allTasks, 'Status').map(val => ({ value: val, label: val }));
  const strategyOptions = getUniqueValues(allTasks, 'Estratégia').map(val => ({ value: val, label: val }));
  const priorityOptions = getUniqueValues(allTasks, 'Prioridade').map(val => ({ value: val, label: val }));

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r print:hidden">
      <SidebarHeader>
        <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
          Filtros
        </h2>
      </SidebarHeader>
      <SidebarContent className="p-0">
        <SidebarGroup>
          <SidebarGroupContent className="space-y-4 p-4">
            <div>
              <Label htmlFor="filterDateRange" className="block text-xs font-medium text-muted-foreground mb-1.5">Período (Criação):</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="filterDateRange"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-9 text-xs",
                      !filters.dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {filters.dateRange?.from ? (
                      filters.dateRange.to ? (
                        <>
                          {format(filters.dateRange.from, "dd/MM/y", { locale: ptBR })} - {format(filters.dateRange.to, "dd/MM/y", { locale: ptBR })}
                        </>
                      ) : (
                        format(filters.dateRange.from, "dd/MM/y", { locale: ptBR })
                      )
                    ) : (
                      <span>Selecione o período</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={filters.dateRange?.from}
                    selected={filters.dateRange}
                    onSelect={handleDateRangeChange}
                    numberOfMonths={1}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <MultiSelect
              id="filterResponsible"
              label="Responsável"
              options={responsibleOptions}
              selected={filters.responsibles}
              onChange={(val) => handleFilterChange('responsibles', val)}
              placeholder="Todos"
            />

            <MultiSelect
              id="filterStatus"
              label="Status"
              options={statusOptions}
              selected={filters.statuses}
              onChange={(val) => handleFilterChange('statuses', val)}
              placeholder="Todos"
            />
            
            <MultiSelect
              id="filterStrategy"
              label="Estratégia"
              options={strategyOptions}
              selected={filters.strategies}
              onChange={(val) => handleFilterChange('strategies', val)}
              placeholder="Todas"
            />

            <MultiSelect
              id="filterPriority"
              label="Prioridade"
              options={priorityOptions}
              selected={filters.priorities}
              onChange={(val) => handleFilterChange('priorities', val)}
              placeholder="Todas"
            />

            <div>
              <Label htmlFor="filterPaused" className="block text-xs font-medium text-muted-foreground mb-1.5">Pausada:</Label>
              <ShadcnSelect value={filters.paused} onValueChange={(val) => handleFilterChange('paused', val)}>
                <SelectTrigger id="filterPaused" className="w-full text-xs h-9 font-normal">
                  <SelectValue placeholder="Ambos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">Ambos</SelectItem>
                  <SelectItem value="Sim" className="text-xs">Sim</SelectItem>
                  <SelectItem value="Não" className="text-xs">Não</SelectItem>
                </SelectContent>
              </ShadcnSelect>
            </div>

             <div>
              <Label htmlFor="filterWaitingOnSomeone" className="block text-xs font-medium text-muted-foreground mb-1.5">Com Pendência Externa:</Label>
              <ShadcnSelect value={filters.waitingOnSomeone} onValueChange={(val) => handleFilterChange('waitingOnSomeone', val)}>
                <SelectTrigger id="filterWaitingOnSomeone" className="w-full text-xs h-9 font-normal">
                  <SelectValue placeholder="Ambos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">Ambos</SelectItem>
                  <SelectItem value="yes" className="text-xs">Sim</SelectItem>
                  <SelectItem value="no" className="text-xs">Não</SelectItem>
                </SelectContent>
              </ShadcnSelect>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <Button onClick={handleClear} variant="outline" className="w-full text-accent border-accent/70 hover:border-accent hover:text-accent hover:bg-accent/10">
          <RotateCcw className="mr-2 h-4 w-4" /> Limpar Filtros
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
