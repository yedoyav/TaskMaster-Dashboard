
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import type { Task } from '@/lib/constants';
import { DATE_LOCALE, getStatusColor } from '@/lib/constants';

interface CriticalTaskModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  tasks: Task[];
}

export default function CriticalTaskModal({ isOpen, onOpenChange, title, tasks }: CriticalTaskModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col bg-card border-border">
        <DialogHeader className="border-b border-border/50 pb-3.5 mb-4">
          <DialogTitle className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            {title} ({tasks.length})
          </DialogTitle>
          <DialogDescription>
            Lista de tarefas que requerem atenção.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-grow custom-scrollbar pr-2 max-h-[60vh]">
          {tasks.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhuma tarefa encontrada para esta categoria.</p>
          ) : (
            <ul className="divide-y divide-border/30">
              {tasks
                .sort((a, b) => {
                  const aPrazo = a.Prazo ? a.Prazo.getTime() : null;
                  const bPrazo = b.Prazo ? b.Prazo.getTime() : null;

                  if (aPrazo && bPrazo) {
                    return aPrazo - bPrazo; // Ambas têm prazo, ordenar pelo prazo
                  }
                  if (aPrazo) {
                    return -1; // 'a' tem prazo, 'b' não. 'a' vem primeiro.
                  }
                  if (bPrazo) {
                    return 1; // 'b' tem prazo, 'a' não. 'b' vem primeiro.
                  }
                  // Nenhuma tem prazo, ordenar pelo ID
                  return a['ID da tarefa'] - b['ID da tarefa'];
                })
                .map((task) => {
                  const prazo = task.Prazo ? task.Prazo.toLocaleDateString(DATE_LOCALE, {day: '2-digit', month: '2-digit', year: 'numeric'}) : 'N/D';
                  const taskLink = task.urlApp || task.urlCliente;
                  const statusColorDot = getStatusColor(task.AtrasadaCalculado && task.Status !== 'Finalizado' ? 'Atrasada' : task.Status);

                  return (
                    <li key={task['ID da tarefa']} className="py-3 px-1 hover:bg-card-foreground/5">
                      <strong className="text-base font-medium text-foreground block mb-0.5">{task.Tarefa || 'Tarefa sem nome'}</strong>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <p>(ID: {task['ID da tarefa']})</p>
                        <p>
                          Prazo: {prazo} | 
                          <span className="inline-flex items-center ml-1">
                             <svg className="w-2 h-2 mr-1" fill={statusColorDot} viewBox="0 0 8 8"><circle cx="4" cy="4" r="4"/></svg> {task.Status}
                          </span> | 
                          Resp: {task['Responsável'] || 'N/A'} | 
                          Prior.: {task.Prioridade || 'N/D'}
                        </p>
                        {task.ComPendenciaExternaCalculado && task['Pendente com'] && (
                          <p>Pendente com: {task['Pendente com']}</p>
                        )}
                      </div>
                      {taskLink ? (
                        <Button variant="link" size="sm" asChild className="text-accent hover:text-accent/80 px-0 h-auto mt-1.5 py-0">
                          <Link href={taskLink} target="_blank" rel="noopener noreferrer">Abrir Tarefa</Link>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground mt-1.5 inline-block">Sem link</span>
                      )}
                    </li>
                  );
              })}
            </ul>
          )}
        </ScrollArea>
        <DialogFooter className="pt-4 border-t border-border/30">
          <DialogClose asChild>
            <Button type="button" variant="outline">Fechar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
