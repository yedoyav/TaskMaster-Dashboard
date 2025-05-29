'use server';

/**
 * @fileOverview An AI agent to analyze task workflow bottlenecks and suggest optimizations.
 *
 * - analyzeWorkflowBottlenecks - A function that handles the bottleneck analysis process.
 * - WorkflowBottleneckAnalysisInput - The input type for the analyzeWorkflowBottlenecks function.
 * - WorkflowBottleneckAnalysisOutput - The return type for the analyzeWorkflowBottlenecks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WorkflowBottleneckAnalysisInputSchema = z.object({
  taskDataCsv: z.string().describe('Uma string CSV contendo dados históricos de tarefas. Cada linha deve representar uma tarefa, e a primeira linha deve conter cabeçalhos como status, responsavel, estrategia, tempo de conclusao, etc.'),
});
export type WorkflowBottleneckAnalysisInput = z.infer<typeof WorkflowBottleneckAnalysisInputSchema>;

const WorkflowBottleneckAnalysisOutputSchema = z.object({
  bottleneckIdentifications: z.string().describe('Gargalos identificados nos fluxos de trabalho das tarefas, como etapas com atrasos excessivos ou problemas de alocação de recursos.'),
  optimizationSuggestions: z.string().describe('Sugestões para otimizar os fluxos de trabalho das tarefas com base nos gargalos identificados, como realocar recursos ou ajustar dependências de tarefas.'),
});
export type WorkflowBottleneckAnalysisOutput = z.infer<typeof WorkflowBottleneckAnalysisOutputSchema>;

export async function analyzeWorkflowBottlenecks(input: WorkflowBottleneckAnalysisInput): Promise<WorkflowBottleneckAnalysisOutput> {
  return analyzeWorkflowBottlenecksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'workflowBottleneckAnalysisPrompt',
  input: {schema: WorkflowBottleneckAnalysisInputSchema},
  output: {schema: WorkflowBottleneckAnalysisOutputSchema},
  prompt: `Você é um consultor especialista em gerenciamento de projetos, especializado em identificar e resolver gargalos de fluxo de trabalho.

Você analisará os dados históricos de tarefas fornecidos, formatados como uma string CSV, para identificar gargalos e sugerir otimizações para melhorar a eficiência. A primeira linha do CSV conterá os cabeçalhos.

Analise os seguintes dados de tarefas (formato CSV):

{{{taskDataCsv}}}

Com base nesses dados, identifique gargalos nos fluxos de trabalho das tarefas e sugira otimizações. Seja específico.
`,
});

const analyzeWorkflowBottlenecksFlow = ai.defineFlow(
  {
    name: 'analyzeWorkflowBottlenecksFlow',
    inputSchema: WorkflowBottleneckAnalysisInputSchema,
    outputSchema: WorkflowBottleneckAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
