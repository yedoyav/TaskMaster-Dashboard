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
  taskDataCsv: z.string().describe('A CSV string containing historical task data. Each row should represent a task, and the first row must contain headers like status, responsible, strategy, completion time, etc.'),
});
export type WorkflowBottleneckAnalysisInput = z.infer<typeof WorkflowBottleneckAnalysisInputSchema>;

const WorkflowBottleneckAnalysisOutputSchema = z.object({
  bottleneckIdentifications: z.string().describe('Identified bottlenecks in the task workflows, such as stages with excessive delays or resource allocation issues.'),
  optimizationSuggestions: z.string().describe('Suggestions for optimizing task workflows based on the identified bottlenecks, such as reallocating resources or adjusting task dependencies.'),
});
export type WorkflowBottleneckAnalysisOutput = z.infer<typeof WorkflowBottleneckAnalysisOutputSchema>;

export async function analyzeWorkflowBottlenecks(input: WorkflowBottleneckAnalysisInput): Promise<WorkflowBottleneckAnalysisOutput> {
  return analyzeWorkflowBottlenecksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'workflowBottleneckAnalysisPrompt',
  input: {schema: WorkflowBottleneckAnalysisInputSchema},
  output: {schema: WorkflowBottleneckAnalysisOutputSchema},
  prompt: `You are an expert project management consultant specializing in identifying and resolving workflow bottlenecks.

You will analyze the provided historical task data, formatted as a CSV string, to identify bottlenecks and suggest optimizations to improve efficiency. The first row of the CSV will contain the headers.

Analyze the following task data (CSV format):

{{{taskDataCsv}}}

Based on this data, identify bottlenecks in the task workflows and suggest optimizations. Be specific.
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
