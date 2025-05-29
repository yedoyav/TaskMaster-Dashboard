import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react'; // Import LucideIcon

interface CriticalKpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon; // Add icon prop
  iconColorClass?: string;
  cardColorClass?: string; // For background or border emphasis
  textColorClass?: string;
  onClick?: () => void;
  className?: string;
  description?: string;
}

export default function CriticalKpiCard({
  title,
  value,
  icon: Icon, // Destructure icon
  iconColorClass = "text-destructive-foreground", // Default icon color for critical cards
  cardColorClass = "bg-destructive/10 border-destructive/30", // Example: subtle red background
  textColorClass = "text-destructive", // For title and value
  onClick,
  className,
  description
}: CriticalKpiCardProps) {
  return (
    <Card 
      className={cn(
        "shadow-yav-md p-4 rounded-lg border-l-4 transition-all duration-300 ease-out hover:shadow-yav-lg hover:scale-[1.03]",
        cardColorClass, // Apply the card background/border color
        onClick ? "cursor-pointer" : "",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-0">
        <CardTitle className={cn("text-xs font-semibold uppercase tracking-wider", textColorClass)}>{title}</CardTitle>
        <div className={cn("p-1.5 rounded-md", iconColorClass, cardColorClass ? 'bg-destructive/20' : 'bg-destructive/10')}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-1">
        <p className={cn("text-3xl font-bold", textColorClass)}>{value}</p>
        {description && <p className="text-xs text-muted-foreground/90 mt-1">{description}</p>}
        {onClick && <span className="text-xs text-muted-foreground hover:text-accent mt-2 inline-block">Ver Lista</span>}
      </CardContent>
    </Card>
  );
}
