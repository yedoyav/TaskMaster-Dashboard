"use server"; // For using server actions, but the flow call is already server-side.
// Let's make this a client component to handle form state, and call the server action.

import AiAnalysisForm from '@/components/dashboard/AiAnalysisForm';
import { analyzeWorkflowBottlenecks, type WorkflowBottleneckAnalysisInput, type WorkflowBottleneckAnalysisOutput } from '@/ai/flows/workflow-bottleneck-analysis';
import { SidebarInset } from '@/components/ui/sidebar'; // Using SidebarInset for consistent page structure

async function handleAnalyzeTasks(input: WorkflowBottleneckAnalysisInput): Promise<WorkflowBottleneckAnalysisOutput | { error: string }> {
  "use server"; // This specific function is a server action
  try {
    // Validate input if necessary, or rely on Zod schema in the flow.
    // For simplicity, directly call.
    // The flow itself is already a server function.
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

// "use client";
// import AiAnalysisForm from '@/components/dashboard/AiAnalysisForm';
// import { analyzeWorkflowBottlenecks, type WorkflowBottleneckAnalysisInput, type WorkflowBottleneckAnalysisOutput } from '@/ai/flows/workflow-bottleneck-analysis';
// import { SidebarInset } from '@/components/ui/sidebar';

// // This function will be passed to AiAnalysisForm and called from the client.
// // It then calls the server action.
// async function callAnalyzeWorkflowBottlenecks(input: WorkflowBottleneckAnalysisInput): Promise<WorkflowBottleneckAnalysisOutput | { error: string }> {
//   // This is where you would typically call a server action if this component was purely client-side.
//   // Since the AI flow is already defined as a server export, we can call it directly.
//   // However, to make it callable from a client component, we need a server action wrapper.
//   // Let's define a server action in this file for simplicity or import one.
  
//   // "use server"; // This is implicitly a server context if the file is a server component.
//   // For client component calling server code, needs explicit server action.

//   // The server action is better defined in the page itself if it's simple like this.
//   // We'll make the page a server component that passes down the server action.
//   // Let's revert this file to a Server Component and pass the action.

//   // This is a placeholder if we were to call an API endpoint
//   // const response = await fetch('/api/analyze-tasks', {
//   //   method: 'POST',
//   //   headers: { 'Content-Type': 'application/json' },
//   //   body: JSON.stringify(input),
//   // });
//   // if (!response.ok) {
//   //   const errorData = await response.json();
//   //   return { error: errorData.message || "Failed to analyze tasks." };
//   // }
//   // return response.json();
  
//   // This will be replaced by the server action passed as a prop
//   console.warn("callAnalyzeWorkflowBottlenecks is a placeholder and should be replaced by a server action call.");
//   return { error: "Analysis function not implemented in client." };
// }


// export default function AnalysisPage() {
//   return (
//     <SidebarInset className="flex-1 p-4 md:p-6 lg:p-8 custom-scrollbar">
//       <div className="container mx-auto">
//         <AiAnalysisForm analyzeTasks={callAnalyzeWorkflowBottlenecks} />
//       </div>
//     </SidebarInset>
//   );
// }
