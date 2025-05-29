"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import type { OverallStatusProcessedData, OverallStatusSummaryItem } from '@/lib/chart-utils';

interface OverallStatusGaugeChartProps {
  data: OverallStatusProcessedData;
}

export default function OverallStatusGaugeChart({ data }: OverallStatusGaugeChartProps) {
  const { chartData, summaryData, progressPercentage } = data;

  const chartAvailable = chartData.datasets[0].data.length > 0 && chartData.datasets[0].data.some(d => d > 0);
  const noDataPlaceholder = chartData.datasets[0].labels[0] === 'N/D' && chartData.datasets[0].data[0] === 1 && chartData.datasets[0].data.length === 1;


  return (
    <Card className="lg:col-span-2 flex flex-col shadow-yav-xl border border-border/20">
      <CardHeader>
        <CardTitle className="text-xl font-semibold border-b border-border/50 pb-3 mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
          Visão Geral do Projeto
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow bg-card-foreground/5 p-5 rounded-lg shadow-inner border border-border/30 flex flex-col items-center justify-center relative">
        {(!chartAvailable || noDataPlaceholder) ? (
          <div className="text-center text-muted-foreground py-10">
            <p>Nenhuma tarefa para exibir a visão geral com os filtros atuais.</p>
          </div>
        ) : (
          <>
            <ChartContainer config={{}} className="mx-auto aspect-square max-h-[250px] w-full">
              <PieChart>
                <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabelยอดนิยม 
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
                      name: chartData.datasets[0].labels[index], // Recharts uses 'name' for label in Pie
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
                  startAngle={225} // (180 + 45)
                  endAngle={-45} // (0 - 45)
                  paddingAngle={1}
                  stroke="hsl(var(--card))"
                  strokeWidth={2}
                >
                  {chartData.datasets[0].data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={chartData.datasets[0].backgroundColor[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-3xl font-bold text-foreground">
                  {noDataPlaceholder ? "N/D" : `${progressPercentage.toFixed(0)}%`}
                </p>
                {!noDataPlaceholder && <p className="text-sm text-muted-foreground">Concluído</p>}
              </div>
          </>
        )}
        <div className="mt-5 w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-3 gap-y-4 text-xs sm:text-sm">
          {summaryData.map((item) => (
            (item.key === 'TotalTarefas' || item.count > 0 || (data.summaryData[0].count > 0 && item.count ===0)) && !noDataPlaceholder ? (
              <div key={item.key} className="flex flex-col items-center justify-center text-center p-1">
                <p className="text-xl font-bold" style={{ color: item.isBold ? item.color : item.color }}>
                  {item.count}
                </p>
                <p className="text-xs text-muted-foreground whitespace-nowrap">{item.label}</p>
              </div>
            ) : null
          ))}
           {summaryData.every(item => item.count === 0 && item.key !== 'TotalTarefas') && summaryData[0].count === 0 && (
            <p className="col-span-full text-center text-muted-foreground p-2">Nenhum dado para o resumo (filtros aplicados).</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
