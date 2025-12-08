import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cardVariants } from "./shared-animation-variants";

interface DashboardCardProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  containerClassName?: string;
  icon?: ReactNode;
  gradient?: "primary" | "accent" | "secondary" | "none";
}

export function DashboardCard({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
  containerClassName,
  icon,
  gradient = "none",
}: DashboardCardProps) {
  const showHeader = title || description || action || icon;

  // Gradient border styles
  const gradientClasses = {
    primary: "before:from-primary/20 before:to-accent/20",
    accent: "before:from-accent/20 before:to-primary/20",
    secondary: "before:from-secondary/20 before:to-accent/20",
    none: "",
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={containerClassName}
    >
      <Card
        className={cn(
          "relative overflow-hidden border-border shadow-sm transition-all duration-300",
          "dark:border-border/80",
          "hover:shadow-lg hover:border-primary/20 dark:hover:border-primary/30",
          gradient !== "none" && [
            "before:absolute before:inset-0 before:rounded-xl before:p-[1px]",
            "before:bg-gradient-to-br before:opacity-0 before:transition-opacity before:duration-300",
            "hover:before:opacity-100",
            gradientClasses[gradient],
          ],
          className
        )}
      >
        {showHeader && (
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                {icon && (
                  <span className="flex items-center justify-center p-1.5 rounded-lg bg-muted/80 border border-border/50">
                    {icon}
                  </span>
                )}
                {title}
              </CardTitle>
              {description && (
                <CardDescription className="text-xs text-muted-foreground">
                  {description}
                </CardDescription>
              )}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </CardHeader>
        )}
        <CardContent className={cn("pt-4", contentClassName)}>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}
