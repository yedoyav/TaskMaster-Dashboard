'use server';
/**
 * @fileOverview An AI flow to analyze project task data and provide insights.
 *
 * - dashboardAnalysisFlow - A function that handles the dashboard analysis.
 * - DashboardAnalysisInput - The input type for the dashboardAnalysisFlow function.
 * - DashboardAnalysisOutput - The return type for the dashboardAnalysisFlow function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { Task } from '@/lib/constants';

const DashboardAnalysisInputSchema = z.object({
  tasksJson: z.string().describe('A JSON string representing an array of Task objects.'),
});
export type DashboardAnalysisInput = z.infer<typeof DashboardAnalysisInputSchema>;

const DashboardAnalysisOutputSchema = z.object({
  executiveSummary: z.string().describe("A brief, high-level summary of the project's current status based on the tasks. Should be 2-3 sentences."),
  bottlenecks: z.array(z.string()).describe('A list of identified bottlenecks or key problem areas. For example, a specific person being overloaded or a stage where tasks get stuck.'),
  positiveHighlights: z.array(z.string()).describe("A list of positive trends or successes. For example, a high completion rate this week or a well-managed stage."),
  suggestions: z.array(z.string()).describe('A list of actionable suggestions to improve project flow or address bottlenecks.'),
});
export type DashboardAnalysisOutput = z.infer<typeof DashboardAnalysisOutputSchema>;


export async function analyzeDashboard(input: DashboardAnalysisInput): Promise<DashboardAnalysisOutput> {
  return dashboardAnalysisFlow(input);
}


const prompt = ai.definePrompt({
  name: 'dashboardAnalysisPrompt',
  input: { schema: DashboardAnalysisInputSchema },
  output: { schema: DashboardAnalysisOutputSchema },
  prompt: `You are a world-class project management expert. Your task is to analyze a list of tasks from a project dashboard, provided as a JSON string.
Today's date is ${new Date().toLocaleDateString('pt-BR')}.

Analyze the data to identify key insights. Provide a concise executive summary, pinpoint specific bottlenecks (e.g., overloaded individuals, stages with high delays), highlight positive trends, and offer actionable suggestions for improvement.

Focus on what is most critical and impactful. Do not just state numbers; interpret them. For example, instead of "There are 10 overdue tasks", say "A significant number of tasks are overdue, indicating potential timeline risks."

Here is the task data in JSON format:
{{{tasksJson}}}
`,
});

const dashboardAnalysisFlow = ai.defineFlow(
  {
    name: 'dashboardAnalysisFlow',
    inputSchema: DashboardAnalysisInputSchema,
    outputSchema: DashboardAnalysisOutputSchema,
  },
  async (input) => {
    try {
      const parsedTasks: Task[] = JSON.parse(input.tasksJson);
      // We could add more complex logic here if needed, but for now, we pass it directly to the LLM.
      // For example, pre-calculating some stats if the list is too long for the context window.
      if (parsedTasks.length === 0) {
        return {
            executiveSummary: "Não há tarefas para analisar com os filtros atuais. Altere os filtros para obter uma análise.",
            bottlenecks: [],
            positiveHighlights: [],
            suggestions: ["Tente limpar os filtros ou selecionar um período de tempo maior."]
        }
      }
      
      const { output } = await prompt(input);
      return output!;

    } catch (error) {
      console.error("Error in dashboardAnalysisFlow: ", error);
      // Return a structured error response
      return {
        executiveSummary: "Ocorreu um erro ao analisar os dados.",
        bottlenecks: ["A análise da IA falhou."],
        positiveHighlights: [],
        suggestions: ["Verifique o console para mais detalhes do erro ou tente novamente."],
      };
    }
  }
);
