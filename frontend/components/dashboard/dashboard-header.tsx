import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Calendar, Play } from "lucide-react";
import { cardVariants } from "./shared-animation-variants";

interface DashboardHeaderProps {
  greeting: string;
  firstName: string;
}

export function DashboardHeader({ greeting, firstName }: DashboardHeaderProps) {
  return (
    <motion.div
      variants={cardVariants}
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {greeting}, {firstName}!
        </h1>
        <p className="text-sm text-muted-foreground">
          Ready to level up your interview skills?
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="default" className="gap-2 px-4">
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Schedule</span>
        </Button>
        <Button size="default" className="gap-2 px-4">
          <Play className="h-4 w-4" />
          Start Interview
        </Button>
      </div>
    </motion.div>
  );
}
