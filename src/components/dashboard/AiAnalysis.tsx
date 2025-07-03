
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Loader2, ServerCrash, Check, FileText, BarChart2, Lightbulb } from 'lucide-react';
import { analyzeDashboard, type DashboardAnalysisOutput } from '@/ai/flows/dashboard-analysis-flow';
import type { Task } from '@/lib/constants';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface AiAnalysisProps {
  filteredTasks: Task[];
}

export default function AiAnalysis({ filteredTasks }: AiAnalysisProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<DashboardAnalysisOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      // Serialize tasks, removing complex objects like Dates before stringifying
      const simplifiedTasks = filteredTasks.map(task => {
        const simplified: Record<string, any> = {};
        for (const key in task) {
            const value = (task as any)[key];
            if (value instanceof Date) {
                simplified[key] = value.toISOString().split('T')[0]; // Format as YYYY-MM-DD
            } else if (typeof value !== 'function') {
                simplified[key] = value;
            }
        }
        return simplified;
      });

      const result = await analyzeDashboard({ tasksJson: JSON.stringify(simplifiedTasks) });
      setAnalysis(result);
    } catch (err) {
      console.error("AI Analysis failed:", err);
      setError("A análise da IA falhou. Verifique o console para mais detalhes.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-xl border-border/30 bg-card/80 backdrop-blur-sm">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            <Wand2 className="h-6 w-6 text-primary" />
            Análise de Performance por IA
          </CardTitle>
          <CardDescription className="mt-1.5">
            Clique no botão para obter insights e sugestões sobre os dados atuais.
          </CardDescription>
        </div>
        <Button onClick={handleAnalysis} disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Gerar Análise
            </>
          )}
        </Button>
      </CardHeader>

      {error && (
        <CardContent>
            <Alert variant="destructive">
                <ServerCrash className="h-4 w-4" />
                <AlertTitle>Erro na Análise</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        </CardContent>
      )}

      {analysis && (
        <CardContent className="space-y-6 pt-2">
            <div className="p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
                <h4 className="flex items-center gap-2 font-semibold text-foreground mb-2">
                    <FileText className="h-5 w-5 text-primary/80" />
                    Resumo Executivo
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{analysis.executiveSummary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysis.bottlenecks.length > 0 && (
                     <div className="p-4 bg-status-yellow/10 rounded-lg">
                        <h4 className="flex items-center gap-2 font-semibold text-status-yellow mb-2">
                            <BarChart2 className="h-5 w-5" />
                            Gargalos
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {analysis.bottlenecks.map((item, i) => <li key={`bottleneck-${i}`}>{item}</li>)}
                        </ul>
                    </div>
                )}
                {analysis.positiveHighlights.length > 0 && (
                    <div className="p-4 bg-status-green/10 rounded-lg">
                        <h4 className="flex items-center gap-2 font-semibold text-status-green mb-2">
                            <Check className="h-5 w-5" />
                            Destaques Positivos
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {analysis.positiveHighlights.map((item, i) => <li key={`highlight-${i}`}>{item}</li>)}
                        </ul>
                    </div>
                )}
                {analysis.suggestions.length > 0 && (
                    <div className="p-4 bg-status-blue/10 rounded-lg">
                        <h4 className="flex items-center gap-2 font-semibold text-status-blue mb-2">
                            <Lightbulb className="h-5 w-5" />
                            Sugestões
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {analysis.suggestions.map((item, i) => <li key={`suggestion-${i}`}>{item}</li>)}
                        </ul>
                    </div>
                )}
            </div>
        </CardContent>
      )}
    </Card>
  );
}
