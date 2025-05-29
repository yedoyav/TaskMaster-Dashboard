"use server"; 

import AiAnalysisForm from '@/components/dashboard/AiAnalysisForm';
import { analyzeWorkflowBottlenecks, type WorkflowBottleneckAnalysisInput, type WorkflowBottleneckAnalysisOutput } from '@/ai/flows/workflow-bottleneck-analysis';
import { SidebarInset } from '@/components/ui/sidebar'; 

async function handleAnalyzeTasks(input: WorkflowBottleneckAnalysisInput): Promise<WorkflowBottleneckAnalysisOutput | { error: string }> {
  "use server"; 
  try {
    const result = await analyzeWorkflowBottlenecks(input);
    return result;
  } catch (error: any) {
    console.error("Error calling AI flow:", error);
    return { error: error.message || "Ocorreu um erro ao processar a análise." };
  }
}


export default async function AnalysisPage() {
  return (
    <SidebarInset className="flex-1 p-4 md:p-6 lg:p-8 custom-scrollbar">
      <div className="container mx-auto">
        <AiAnalysisForm analyzeTasks={handleAnalyzeTasks} />
      </div>
    </SidebarInset>
  );
}
