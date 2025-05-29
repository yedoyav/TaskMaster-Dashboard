"use client";

import type { ChangeEvent } from 'react';
import { useState } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UploadCloud, FileText, AlertTriangle, Loader2 } from 'lucide-react';
import { processRow } from '@/lib/data-processor';
import type { Task } from '@/lib/constants';

interface CsvImportProps {
  onDataLoaded: (data: Task[], fileName: string) => void;
  onLoadingChange: (loading: boolean) => void;
}

export default function CsvImport({ onDataLoaded, onLoadingChange }: CsvImportProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setIsLoading(true);
    onLoadingChange(true);

    Papa.parse<Record<string, any>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setIsLoading(false);
        onLoadingChange(false);

        if (results.errors && results.errors.length > 0) {
          console.error("Erros ao parsear CSV:", results.errors);
          setError(`Erro ao ler o arquivo: ${results.errors.map(e => e.message).join(', ')}. Verifique o formato do CSV.`);
          setFileName(null); // Clear filename on error
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
        onDataLoaded(processedData, file.name);
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
    <section className="flex-grow flex flex-col items-center justify-center p-6 text-center container mx-auto relative bg-background">
      <div className="w-full max-w-lg bg-card p-8 sm:p-10 rounded-xl shadow-yav-xl border border-border transform transition-all duration-500 ease-out">
        <h2 className="text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary bg-size-200 bg-pos-0 hover:bg-pos-100 transition-all duration-500 ease-linear">
          Dashboard de Tarefas
        </h2>
        <p className="text-muted-foreground text-lg mb-10">Acompanhamento de Implementação YAV</p>

        <Button asChild size="lg" className="w-full max-w-xs mx-auto bg-gradient-to-r from-primary to-accent hover:saturate-150 text-primary-foreground font-semibold py-3.5 px-8 rounded-lg shadow-lg hover:shadow-yav-md transition-all duration-300 ease-in-out inline-flex items-center justify-center space-x-2.5 text-base transform hover:scale-105 cursor-pointer">
          <label htmlFor="csvFile" className="cursor-pointer">
            <UploadCloud className="w-6 h-6 mr-2" />
            Carregar CSV
          </label>
        </Button>
        <Input type="file" id="csvFile" accept=".csv" className="hidden" onChange={handleFileChange} disabled={isLoading} />

        <div className="mt-10 text-center min-h-[100px]">
          {isLoading ? (
            <>
              <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
              <p className="text-foreground text-lg font-medium">Carregando: {fileName || 'arquivo'}...</p>
              <p className="text-muted-foreground text-sm mt-1.5">Aguarde enquanto processamos seu arquivo.</p>
            </>
          ) : error ? (
            <Alert variant="destructive" className="text-left">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle>Erro ao Carregar</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : fileName ? (
             <>
              <FileText className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-foreground text-lg font-medium">Arquivo carregado: {fileName}</p>
              <p className="text-muted-foreground text-sm mt-1.5">Pronto para processar.</p>
            </>
          ) : (
            <>
              <FileText className="w-12 h-12 text-border mx-auto mb-4" />
              <p className="text-foreground text-lg font-medium">Nenhum dado carregado</p>
              <p className="text-muted-foreground text-sm mt-1.5">Por favor, carregue um arquivo CSV para visualizar o dashboard.</p>
            </>
          )}
        </div>
      </div>
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-xs text-muted-foreground/70">YAV Digital - Dashboard de Implementação © {new Date().getFullYear()}</p>
      </div>
    </section>
  );
}
