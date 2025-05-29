
"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import type { WeeklyTrendChartData } from '@/lib/chart-utils';
import { lineChartConfig } from '@/lib/chart-utils';
import { TrendingUp } from 'lucide-react';

interface WeeklyConclusionTrendChartProps {
  data: WeeklyTrendChartData;
}

export default function WeeklyConclusionTrendChart({ data }: WeeklyConclusionTrendChartProps) {
  const chartData = data.labels.map((label, index) => ({
    name: label,
    completed: data.datasets[0].data[index] || 0,
    active: data.datasets[1].data[index] || 0,
  }));

  const chartAvailable = chartData.length > 1 && (chartData.some(d => d.completed > 0) || chartData.some(d => d.active > 0));
  const hasSomeData = chartData.length > 0 && (chartData.some(d => d.completed > 0) || chartData.some(d => d.active > 0));
  
  return (
    <Card className="flex flex-col shadow-yav-lg border border-border/30 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Tendência Semanal
        </CardTitle>
        <CardDescription className="text-xs">Evolução de tarefas concluídas vs. não concluídas.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow bg-card-foreground/5 p-4 rounded-b-lg min-h-[300px] sm:min-h-[350px]">
        {chartAvailable ? (
          <ChartContainer config={lineChartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.3)" />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={10} 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8} 
                  allowDecimals={false} 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip
                  cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1.5, strokeDasharray: '3 3' }}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Legend 
                  verticalAlign="bottom"
                  content={({ payload }) => (
                    <div className="flex justify-center space-x-4 mt-3">
                      {payload?.map((entry, index) => (
                        <div key={`item-${index}`} className="flex items-center space-x-1.5">
                          <span style={{ backgroundColor: entry.color }} className="h-2.5 w-2.5 inline-block rounded-full"></span>
                          <span className="text-xs text-muted-foreground">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  )} 
                />
                <defs>
                  <linearGradient id="fillCompletedTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-completed)" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="var(--color-completed)" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="fillActiveTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-active)" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="var(--color-active)" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="completed" stroke="var(--color-completed)" fill="url(#fillCompletedTrend)" strokeWidth={2} dot={{ r:3, fill: 'var(--color-completed)'}} activeDot={{r:6, strokeWidth: 1, stroke: 'hsl(var(--background))'}} />
                <Area type="monotone" dataKey="active" stroke="var(--color-active)" fill="url(#fillActiveTrend)" strokeWidth={2} dot={{ r:3, fill: 'var(--color-active)'}} activeDot={{r:6, strokeWidth: 1, stroke: 'hsl(var(--background))'}}/>
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
            <TrendingUp className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <p className="font-medium text-foreground mb-1">Dados Insuficientes para Tendência</p>
            {hasSomeData && chartData.length <= 1 && (
                 <p className="text-xs max-w-sm">É necessário dados de mais de uma semana para visualizar uma tendência. Verifique os filtros ou as datas no seu CSV.</p>
            )}
            {!hasSomeData && (
                 <p className="text-xs max-w-sm">Não há tarefas concluídas ou ativas nas colunas 'Data de criação' e 'Data de finalização' do seu CSV, ou as datas não estão no formato dd/MM/aaaa. Verifique os filtros aplicados.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

