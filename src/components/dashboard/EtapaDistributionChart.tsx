"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, ChartConfig } from '@/components/ui/chart'; // Shadcn chart components
import type { EtapaDistributionChartData } from '@/lib/chart-utils';
import { etapaChartConfig as chartDisplayConfig } from '@/lib/chart-utils';


interface EtapaDistributionChartProps {
  data: EtapaDistributionChartData;
}

const rechartsChartConfig: ChartConfig = {
  tasks: {
    label: "Nº de Tarefas",
    color: "hsl(var(--primary))",
  },
};


export default function EtapaDistributionChart({ data }: EtapaDistributionChartProps) {
  const chartData = data.labels.map((label, index) => ({
    name: label,
    tasks: data.datasets[0].data[index] || 0,
  }));

  const chartAvailable = chartData.length > 0 && chartData.some(d => d.tasks > 0);

  return (
    <Card className="flex flex-col shadow-yav-xl border border-border/20">
      <CardHeader>
        <CardTitle className="text-xl font-semibold border-b border-border/50 pb-3 mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
          Distribuição por Etapa
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow bg-card-foreground/5 p-5 rounded-lg shadow-inner border border-border/30 min-h-[300px]">
        {chartAvailable ? (
          <ChartContainer config={rechartsChartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20, right:20, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border)/0.5)" />
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
                  width={100} 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                  className="truncate"
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--accent)/0.1)' }}
                  content={<ChartTooltipContent />}
                />
                <Bar dataKey="tasks" radius={4} fill="var(--color-tasks)" />
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
