"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Wand2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { WorkflowBottleneckAnalysisInput, WorkflowBottleneckAnalysisOutput } from '@/ai/flows/workflow-bottleneck-analysis';

const formSchema = z.object({
  taskData: z.string().min(10, { message: "Por favor, insira dados de tarefas em formato JSON." })
    .refine(data => {
      try {
        JSON.parse(data);
        return true;
      } catch {
        return false;
      }
    }, { message: "Os dados inseridos não são um JSON válido."}),
});

type FormValues = z.infer<typeof formSchema>;

interface AiAnalysisFormProps {
  analyzeTasks: (input: WorkflowBottleneckAnalysisInput) => Promise<WorkflowBottleneckAnalysisOutput | { error: string }>;
}

export default function AiAnalysisForm({ analyzeTasks }: AiAnalysisFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<WorkflowBottleneckAnalysisOutput | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      taskData: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setAnalysisResult(null);
    setAnalysisError(null);
    
    const result = await analyzeTasks({ taskData: data.taskData });

    if ('error' in result) {
      setAnalysisError(result.error);
    } else {
      setAnalysisResult(result);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-yav-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            Análise de Gargalos no Fluxo de Trabalho (IA)
          </CardTitle>
          <CardDescription>
            Insira os dados históricos das tarefas em formato JSON para identificar gargalos e receber sugestões de otimização.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="taskData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dados das Tarefas (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Cole aqui o JSON dos dados das tarefas. Ex: [{"id": 1, "status": "Pendente", ...}, ...]'
                        className="min-h-[200px] text-sm bg-background focus-visible:ring-primary"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Cada objeto deve representar uma tarefa com propriedades como status, responsável, estratégia, e tempo de conclusão.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-primary to-accent hover:saturate-150 text-primary-foreground">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Analisar Tarefas
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {analysisResult && (
        <Card className="shadow-yav-md">
          <CardHeader>
            <CardTitle className="text-xl">Resultados da Análise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-primary mb-1">Gargalos Identificados:</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{analysisResult.bottleneckIdentifications}</p>
            </div>
            <div>
              <h4 className="font-semibold text-accent mb-1">Sugestões de Otimização:</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{analysisResult.optimizationSuggestions}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {analysisError && (
        <Alert variant="destructive">
          <AlertTitle>Erro na Análise</AlertTitle>
          <AlertDescription>{analysisError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
