
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { PriorityDistributionChartData } from '@/lib/chart-utils';
import { priorityPieChartConfig } from '@/lib/chart-utils';

interface PriorityDistributionChartProps {
  data: PriorityDistributionChartData;
}

export default function PriorityDistributionChart({ data }: PriorityDistributionChartProps) {
  const chartDataForPie = data.labels.map((label, index) => ({
    name: label,
    value: data.datasets[0].data[index],
    fill: data.datasets[0].backgroundColor[index],
  }));

  const chartConfig = priorityPieChartConfig(data.labels, data.datasets[0].backgroundColor);
  const chartAvailable = chartDataForPie.length > 0 && chartDataForPie.some(d => d.value > 0);
  const noDataPlaceholder = data.labels[0] === 'N/D' && data.datasets[0].data[0] === 1 && data.labels.length ===1 ;

  return (
    <Card className="flex flex-col shadow-yav-lg border border-border/30 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Distribuição por Prioridade
        </CardTitle>
        <CardDescription className="text-xs">Visão das tarefas por nível de prioridade.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow bg-card-foreground/5 p-4 rounded-b-lg flex flex-col items-center justify-center min-h-[300px] sm:min-h-[350px]">
        {chartAvailable && !noDataPlaceholder ? (
          <ChartContainer config={chartConfig} className="aspect-square h-[200px] sm:h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  cursor={{ fill: 'hsl(var(--accent)/0.05)' }}
                  content={<ChartTooltipContent 
                              formatter={(value, name, entry) => (
                                <div className="flex items-center">
                                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.payload.fill, marginRight: '8px' }}></span>
                                  <span>{entry.payload.name}: {typeof value === 'number' ? value.toLocaleString() : value}</span>
                                </div>
                              )}
                            />}
                />
                <Pie
                  data={chartDataForPie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  innerRadius="50%"
                  paddingAngle={2}
                  stroke="hsl(var(--card))"
                  strokeWidth={3}
                >
                  {chartDataForPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend 
                  content={({ payload }) => (
                    <ul className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-3 text-xs text-muted-foreground">
                      {payload?.map((entry, index) => (
                        <li key={`item-${index}`} className="flex items-center">
                          <span className="mr-1.5 h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                          {entry.value} ({((entry.payload as any)?.payload.value / chartDataForPie.reduce((sum, item) => sum + item.value, 0) * 100).toFixed(0)}%)
                        </li>
                      ))}
                    </ul>
                  )}
                  verticalAlign="bottom"
                  wrapperStyle={{paddingTop: "10px"}}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="text-center text-muted-foreground">
            <p>Nenhuma tarefa para exibir a distribuição por prioridade com os filtros atuais.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
