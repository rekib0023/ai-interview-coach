import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  changeColor?: string;
  icon: LucideIcon;
  iconColor: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  change,
  changeColor = "text-stone-500",
  icon: Icon,
  iconColor,
}: StatsCardProps) {
  return (
    <Card className="border-stone-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              {title}
            </p>
            <p className="text-xl font-bold text-stone-900 mt-2">{value}</p>
            {change && (
              <div
                className={`text-xs mt-2 flex items-center gap-1.5 font-medium ${changeColor}`}
              >
                <span className="bg-green-100 px-1.5 py-0.5 rounded text-green-700">
                  {change.split(" ")[0]}
                </span>
                <span className="text-stone-500">from last week</span>
              </div>
            )}
            {subtitle && (
              <p className="text-xs text-stone-500 mt-2 font-medium">
                {subtitle}
              </p>
            )}
          </div>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </CardContent>
    </Card>
  );
}
