"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import type { OverallStatusProcessedData } from '@/lib/chart-utils';

interface OverallStatusGaugeChartProps {
  data: OverallStatusProcessedData;
}

export default function OverallStatusGaugeChart({ data }: OverallStatusGaugeChartProps) {
  const { chartData, summaryData, progressPercentage } = data;

  const chartAvailable = chartData.datasets[0].data.length > 0 && chartData.datasets[0].data.some(d => d > 0);
  const noDataPlaceholder = chartData.datasets[0].labels[0] === 'N/D' && chartData.datasets[0].data[0] === 1 && chartData.datasets[0].data.length === 1;


  return (
    <Card className="flex flex-col shadow-yav-lg border border-border/30 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Visão Geral do Projeto
        </CardTitle>
        <CardDescription className="text-xs">Progresso e distribuição de status.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow bg-card-foreground/5 p-4 rounded-b-lg flex flex-col items-center justify-center relative min-h-[300px] sm:min-h-[350px]">
        {(!chartAvailable || noDataPlaceholder) ? (
          <div className="text-center text-muted-foreground py-10">
            <p>Nenhuma tarefa para exibir a visão geral com os filtros atuais.</p>
          </div>
        ) : (
          <>
            <ChartContainer config={{}} className="mx-auto aspect-square max-h-[200px] sm:max-h-[220px] w-full">
              <PieChart>
                <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel 
                    formatter={(value, name, entry) => (
                      <div className="flex flex-col">
                        <span className="font-medium" style={{ color: entry.payload.fill }}>
                          {entry.payload.payload.label}: {value}
                        </span>
                      </div>
                    )}
                  />}
                />
                <Pie
                  data={chartData.datasets[0].data.map((value, index) => ({
                      name: chartData.datasets[0].labels[index], 
                      value: value,
                      label: chartData.datasets[0].labels[index],
                      fill: chartData.datasets[0].backgroundColor[index]
                  }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="80%"
                  startAngle={225}
                  endAngle={-45} 
                  paddingAngle={2}
                  stroke="hsl(var(--card))"
                  strokeWidth={3}
                >
                  {chartData.datasets[0].data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={chartData.datasets[0].backgroundColor[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-20px] sm:mt-[-25px]">
                <p className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  {noDataPlaceholder ? "N/D" : `${progressPercentage.toFixed(0)}%`}
                </p>
                {!noDataPlaceholder && <p className="text-sm text-muted-foreground mt-1">Concluído</p>}
              </div>
          </>
        )}
        <div className="mt-auto w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-2 gap-y-3 text-xs pt-4">
          {summaryData.map((item) => (
            (item.key === 'TotalTarefas' || item.count > 0 || (data.summaryData[0].count > 0 && item.count ===0)) && !noDataPlaceholder ? (
              <div key={item.key} className="flex flex-col items-center justify-center text-center p-1.5 rounded-md bg-background/50 hover:bg-background transition-colors">
                <p className="text-lg sm:text-xl font-bold" style={{ color: item.isBold ? 'hsl(var(--foreground))' : item.color }}>
                  {item.count}
                </p>
                <p className="text-2xs sm:text-xs text-muted-foreground whitespace-nowrap truncate max-w-[60px] sm:max-w-none">{item.label}</p>
              </div>
            ) : null
          ))}
           {summaryData.every(item => item.count === 0 && item.key !== 'TotalTarefas') && summaryData[0].count === 0 && (
            <p className="col-span-full text-center text-muted-foreground p-2 text-xs">Nenhum dado para o resumo (filtros aplicados).</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
