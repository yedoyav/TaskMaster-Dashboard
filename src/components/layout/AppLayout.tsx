import type { ReactNode } from 'react';
import Header from './Header';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from '@/components/ui/sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        {children}
        <Toaster />
      </div>
    </SidebarProvider>
  );
}
