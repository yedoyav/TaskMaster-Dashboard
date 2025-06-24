
"use client";

import type { ChangeEvent } from 'react';
import { useState } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UploadCloud, FileText, AlertTriangle, Loader2, CheckCircle, ShieldX } from 'lucide-react';
import { processRow } from '@/lib/data-processor';
import type { Task } from '@/lib/constants';
import Image from 'next/image';
import { cn } from '@/lib/utils'; // Added this import

interface CsvImportProps {
  onDataLoaded: (data: Task[], fileName: string) => void;
  onLoadingChange: (loading: boolean) => void;
}

export default function CsvImport({ onDataLoaded, onLoadingChange }: CsvImportProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [processedTasksCount, setProcessedTasksCount] = useState<number | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setIsLoading(true);
    onLoadingChange(true);
    setProcessedTasksCount(null);

    Papa.parse<Record<string, any>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setIsLoading(false);
        onLoadingChange(false);

        if (results.errors && results.errors.length > 0) {
          console.error("Erros ao parsear CSV:", results.errors);
          setError(`Erro ao ler o arquivo: ${results.errors.map(e => e.message).join(', ')}. Verifique o formato do CSV.`);
          setFileName(null); 
          return;
        }

        const requiredHeaders = ['ID da tarefa', 'Tarefa', 'Status', 'Prazo'];
        const csvHeaders = results.meta.fields;

        if (!csvHeaders) {
          setError("Erro ao identificar cabeçalhos no CSV. O arquivo parece estar vazio ou mal formatado.");
          setFileName(null);
          return;
        }

        const missingHeaders = requiredHeaders.filter(header => !csvHeaders.includes(header));
        if (missingHeaders.length > 0) {
          setError(`Erro na estrutura do CSV. Colunas obrigatórias faltando: ${missingHeaders.join(', ')}.`);
          setFileName(null);
          return;
        }

        const processedData = results.data.map(processRow).filter(row => !row._error);
        setProcessedTasksCount(processedData.length);
        if (processedData.length > 0) {
            // Delay slightly to allow UI update before transitioning
            setTimeout(() => onDataLoaded(processedData, file.name), 500);
        } else {
            setError("Nenhuma tarefa válida encontrada no arquivo CSV após o processamento.");
            setFileName(null);
        }
      },
      error: (err: any) => {
        setIsLoading(false);
        onLoadingChange(false);
        console.error("Erro crítico ao parsear CSV:", err);
        setError(`Erro crítico ao carregar o arquivo: ${err.message}. Tente novamente.`);
        setFileName(null);
      }
    });
  };

  return (
    <section className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-background to-card/30">
      <div className="w-full max-w-xl bg-card p-8 sm:p-12 rounded-2xl shadow-xl border border-border/50 transform transition-all duration-500 ease-out hover:shadow-2xl">
        <div className="flex justify-center mb-6">
            <Image 
                src="https://yavdigital.com.br/wp-content/uploads/2025/02/yav-logo-1.webp" 
                alt="YAV Digital Logo" 
                width={180} 
                height={50}
                className="h-12 w-auto"
                priority
            />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-center text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary bg-size-200 bg-pos-0 hover:bg-pos-100 transition-all duration-500 ease-linear">
          TaskMaster Dashboard
        </h1>
        <p className="text-muted-foreground text-md sm:text-lg mb-10 text-center">Inteligência e Agilidade para seu Projeto YAV</p>

        <div className="relative group">
          <label 
            htmlFor="csvFile" 
            className={cn(
              "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
              isLoading ? "border-primary/50 bg-primary/5" : "border-border hover:border-accent/70 bg-background hover:bg-accent/5"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-3" />
                <p className="text-lg font-medium text-primary">Processando: {fileName || 'arquivo'}...</p>
                <p className="text-sm text-muted-foreground mt-1">Aguarde, estamos analisando os dados.</p>
              </>
            ) : fileName && !error && processedTasksCount !== null ? (
              <>
                <CheckCircle className="w-12 h-12 text-status-green mb-3" />
                <p className="text-lg font-medium text-status-green">Sucesso! {processedTasksCount} tarefas carregadas.</p>
                <p className="text-sm text-muted-foreground mt-1">Redirecionando para o dashboard...</p>
              </>
            ) : error ? (
                 <>
                    <ShieldX className="w-12 h-12 text-destructive mb-3" />
                    <p className="text-lg font-medium text-destructive">Falha ao Carregar</p>
                    <p className="text-sm text-muted-foreground mt-1 px-4">{error}</p>
                    <Button variant="link" size="sm" className="mt-2 text-accent" onClick={() => {setError(null); setFileName(null);}}>Tentar Novamente</Button>
                 </>
            ) : (
              <>
                <UploadCloud className="w-12 h-12 text-accent/80 group-hover:text-accent mb-3 transition-colors" />
                <p className="text-lg font-medium text-foreground group-hover:text-accent transition-colors">Clique para carregar ou arraste seu CSV</p>
                <p className="text-sm text-muted-foreground mt-1">Formatos aceitos: .csv</p>
              </>
            )}
            <Input type="file" id="csvFile" accept=".csv" className="hidden" onChange={handleFileChange} disabled={isLoading || (!!fileName && !error)} />
          </label>
        </div>

        {!isLoading && !fileName && !error && (
            <p className="text-xs text-muted-foreground/70 mt-8 text-center">
                Garanta que seu CSV inclua as colunas: 'ID da tarefa', 'Tarefa', 'Status', e 'Prazo'.
            </p>
        )}
      </div>
       <p className="text-xs text-muted-foreground/60 mt-8 text-center">
        YAV Digital - Dashboard de Implementação &copy; {new Date().getFullYear()}
      </p>
    </section>
  );
}

    
