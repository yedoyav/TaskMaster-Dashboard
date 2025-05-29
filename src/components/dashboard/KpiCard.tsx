import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColorClass?: string;
  borderColorClass?: string;
  valueColorClass?: string;
  onClick?: () => void;
  className?: string;
}

export default function KpiCard({
  title,
  value,
  icon: Icon,
  iconColorClass = "text-accent",
  borderColorClass = "border-accent",
  valueColorClass = "text-foreground",
  onClick,
  className
}: KpiCardProps) {
  return (
    <Card 
      className={cn(
        "shadow-yav-lg flex flex-col justify-between transform hover:scale-[1.03] transition-transform duration-200",
        onClick ? "cursor-pointer" : "",
        borderColorClass ? `border-l-4 ${borderColorClass}` : "",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-normal text-muted-foreground">{title}</CardTitle>
         <div className={cn("p-2.5 bg-card-foreground/5 rounded-lg", iconColorClass)}>
            <Icon className="h-6 w-6" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("text-4xl font-bold", valueColorClass)}>{value}</div>
      </CardContent>
    </Card>
  );
}
