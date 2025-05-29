import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { BotMessageSquare } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-card/80 backdrop-blur-lg text-foreground p-4 shadow-md print:hidden sticky top-0 z-50 border-b border-border">
      <div className="container mx-auto flex justify-between items-center h-10">
        <Link href="/" className="flex items-center space-x-2">
          <Image 
            src="https://yavdigital.com.br/wp-content/uploads/2025/02/yav-logo-1.webp" 
            alt="YAV Digital Logo" 
            width={100} 
            height={28}
            className="h-7 w-auto"
            priority
          />
        </Link>
        <nav className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/" className="text-sm font-medium hover:text-primary">Dashboard</Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="border-primary/50 hover:border-primary text-primary hover:text-primary hover:bg-primary/10">
            <Link href="/analysis" className="flex items-center">
              <BotMessageSquare className="mr-2 h-4 w-4" />
              Análise IA
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
