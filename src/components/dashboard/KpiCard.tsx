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
  description?: string;
}

export default function KpiCard({
  title,
  value,
  icon: Icon,
  iconColorClass = "text-accent",
  borderColorClass = "border-accent", // Can be used for a subtle left border or removed
  valueColorClass = "text-foreground",
  onClick,
  className,
  description
}: KpiCardProps) {
  return (
    <Card 
      className={cn(
        "shadow-yav-lg flex flex-col justify-between transition-all duration-300 ease-out hover:shadow-yav-xl hover:scale-[1.02]",
        onClick ? "cursor-pointer" : "",
        // borderColorClass ? `border-l-4 ${borderColorClass}` : "", // Optional: re-add if desired
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {description && <p className="text-xs text-muted-foreground/80">{description}</p>}
        </div>
         <div className={cn("p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg", iconColorClass)}>
            <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("text-3xl font-bold", valueColorClass)}>{value}</div>
      </CardContent>
    </Card>
  );
}
