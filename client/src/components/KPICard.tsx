import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  iconName?: string;
  trend?: 'up' | 'down' | 'neutral';
  change?: number;
  description?: string;
  className?: string;
}

export function KPICard({ title, value, iconName, trend, change, description, className }: KPICardProps) {
  // Dynamically get icon component
  const IconComponent = iconName ? (Icons[iconName as keyof typeof Icons] as LucideIcon) : null;

  return (
    <Card className={cn("overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 bg-card", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground font-sans">
          {title}
        </CardTitle>
        {IconComponent && (
          <div className="h-8 w-8 rounded-full bg-secondary/50 flex items-center justify-center">
            <IconComponent className="h-4 w-4 text-primary" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground font-serif tracking-tight">{value}</div>
        {(trend || description) && (
          <div className="flex items-center mt-1 space-x-2">
            {trend && change !== undefined && (
              <div className={cn(
                "flex items-center text-xs font-medium px-1.5 py-0.5 rounded-full",
                trend === 'up' ? "text-emerald-700 bg-emerald-50" : 
                trend === 'down' ? "text-rose-700 bg-rose-50" : "text-gray-600 bg-gray-100"
              )}>
                {trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : 
                 trend === 'down' ? <ArrowDownRight className="h-3 w-3 mr-1" /> : null}
                {Math.abs(change)}%
              </div>
            )}
            {description && (
              <p className="text-xs text-muted-foreground truncate">
                {description}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
