"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, ChartConfig } from '@/components/ui/chart'; 
import type { EtapaDistributionChartData } from '@/lib/chart-utils';

const rechartsChartConfig: ChartConfig = {
  tasks: {
    label: "Nº de Tarefas",
    color: "hsl(var(--primary))",
  },
};

interface EtapaDistributionChartProps {
  data: EtapaDistributionChartData;
}

export default function EtapaDistributionChart({ data }: EtapaDistributionChartProps) {
  const chartData = data.labels.map((label, index) => ({
    name: label,
    tasks: data.datasets[0].data[index] || 0,
  }));

  const chartAvailable = chartData.length > 0 && chartData.some(d => d.tasks > 0);

  return (
    <Card className="flex flex-col shadow-lg border border-border/30 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Distribuição por Etapa
        </CardTitle>
        <CardDescription className="text-xs">Contagem de tarefas em cada etapa do fluxo.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow bg-card-foreground/5 p-4 rounded-b-lg min-h-[300px] sm:min-h-[350px]">
        {chartAvailable ? (
          <ChartContainer config={rechartsChartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right:30, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border)/0.3)" />
                <XAxis 
                  type="number" 
                  dataKey="tasks" 
                  allowDecimals={false} 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={80} 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                  className="truncate"
                  stroke="hsl(var(--muted-foreground))"
                  interval={0}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--accent)/0.05)' }}
                  content={<ChartTooltipContent />}
                />
                <Bar dataKey="tasks" radius={[0, 4, 4, 0]} fill="var(--color-tasks)" barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-center text-muted-foreground">
            <p>Nenhuma tarefa para exibir a distribuição por etapa com os filtros atuais.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
