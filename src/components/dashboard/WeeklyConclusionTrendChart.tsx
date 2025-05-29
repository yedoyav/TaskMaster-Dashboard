"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import type { WeeklyTrendChartData } from '@/lib/chart-utils';
import { lineChartConfig } from '@/lib/chart-utils';

interface WeeklyConclusionTrendChartProps {
  data: WeeklyTrendChartData;
}

export default function WeeklyConclusionTrendChart({ data }: WeeklyConclusionTrendChartProps) {
  const chartData = data.labels.map((label, index) => ({
    name: label,
    completed: data.datasets[0].data[index] || 0,
    active: data.datasets[1].data[index] || 0,
  }));

  const chartAvailable = chartData.length > 0 && (chartData.some(d => d.completed > 0) || chartData.some(d => d.active > 0));
  
  return (
    <Card className="shadow-yav-xl border border-border/20">
      <CardHeader>
        <CardTitle className="text-xl font-semibold border-b border-border/50 pb-3 mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
          Tendência Semanal
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-card-foreground/5 p-5 rounded-lg shadow-inner border border-border/30 min-h-[350px]">
        {chartAvailable ? (
          <ChartContainer config={lineChartConfig} className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8} 
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
                  cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '3 3' }}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Legend content={({ payload }) => (
                  <div className="flex justify-center space-x-4 mt-2">
                    {payload?.map((entry, index) => (
                      <div key={`item-${index}`} className="flex items-center space-x-1">
                        <span style={{ backgroundColor: entry.color }} className="h-2 w-2 inline-block rounded-full"></span>
                        <span className="text-xs text-muted-foreground">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                )} />
                <defs>
                  <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-completed)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-completed)" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="fillActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-active)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-active)" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="completed" stroke="var(--color-completed)" fill="url(#fillCompleted)" strokeWidth={2} dot={{ r:3, fill: 'var(--color-completed)'}} activeDot={{r:5}} />
                <Area type="monotone" dataKey="active" stroke="var(--color-active)" fill="url(#fillActive)" strokeWidth={2} dot={{ r:3, fill: 'var(--color-active)'}} activeDot={{r:5}}/>
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-center text-muted-foreground">
            <p>Nenhuma tarefa para exibir a tendência semanal com os filtros atuais.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
