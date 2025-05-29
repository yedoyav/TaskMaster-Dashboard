import type { ReactNode } from 'react';
import Header from './Header';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from '@/components/ui/sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <SidebarProvider>
        {/* Este novo div envolverá o conteúdo da página (sidebar e main content) 
            permitindo que sejam organizados como flex items pelo SidebarProvider */}
        <div className="flex flex-1 overflow-hidden"> {/* Adicionado flex e flex-1 para ocupar o espaço restante e overflow-hidden para conter o scroll */}
          {children}
        </div>
      </SidebarProvider>
      <Toaster />
    </div>
  );
}
