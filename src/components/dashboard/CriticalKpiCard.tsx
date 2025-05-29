import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CriticalKpiCardProps {
  title: string;
  value: string | number;
  borderColorClass?: string;
  valueColorClass?: string;
  onClick?: () => void;
  className?: string;
}

export default function CriticalKpiCard({
  title,
  value,
  borderColorClass = "border-status-red",
  valueColorClass = "text-status-red",
  onClick,
  className
}: CriticalKpiCardProps) {
  return (
    <Card 
      className={cn(
        "bg-card-foreground/5 p-5 rounded-lg shadow-lg border-l-4 hover:bg-card-foreground/10 cursor-pointer transform hover:scale-[1.03] transition-transform duration-200",
        borderColorClass,
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="p-0 mb-1.5">
        <CardTitle className={cn("text-sm font-semibold uppercase tracking-wider", valueColorClass)}>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <p className={cn("text-4xl font-bold mt-1.5", valueColorClass)}>{value}</p>
        <span className="text-xs text-muted-foreground hover:text-accent mt-2 inline-block">Ver Lista</span>
      </CardContent>
    </Card>
  );
}
