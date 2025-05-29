"use client";

import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ProgressListItem } from '@/lib/chart-utils';

interface ProgressListProps {
  title: string;
  items: ProgressListItem[];
}

export default function ProgressList({ title, items }: ProgressListProps) {
  
  const getProgressColorClass = (percentage: number) => {
    if (percentage >= 70) return "bg-status-green";
    if (percentage >= 30) return "bg-status-yellow";
    return "bg-status-red";
  };

  return (
    <div className="bg-card-foreground/5 p-5 rounded-lg shadow-inner border border-border/30">
      <h4 className="text-lg font-semibold text-foreground mb-4 text-center">{title}</h4>
      {items.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-center text-muted-foreground">
          <p>Nenhum dado de progresso disponível com os filtros atuais.</p>
        </div>
      ) : (
        <ScrollArea className="h-96 custom-scrollbar pr-3">
          <div className="space-y-3.5 p-1.5">
            {items.map((item) => (
              <div key={item.name} className="p-2.5 bg-card rounded-md hover:bg-card/90 transition-colors duration-150">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-foreground truncate mr-3 flex-1" title={item.name}>
                    {item.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.completed}/{item.total} ({item.percentage.toFixed(0)}%)
                  </span>
                </div>
                <Progress 
                  value={item.percentage} 
                  className="h-2" 
                  indicatorClassName={getProgressColorClass(item.percentage)}
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
