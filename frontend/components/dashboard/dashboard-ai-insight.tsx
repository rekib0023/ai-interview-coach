import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cardVariants } from "./shared-animation-variants";

export function DashboardAiInsight() {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card className="border-border/50 shadow-sm">
        <CardContent className="flex items-center gap-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="mb-0.5 text-sm font-semibold">AI Insight</h3>
            <p className="text-sm text-muted-foreground">
              You've improved significantly in <strong>System Design</strong>{" "}
              this week! Consider tackling <strong>Dynamic Programming</strong>{" "}
              next for balanced growth.
            </p>
          </div>
          <Button variant="ghost" size="sm" className="shrink-0 gap-2">
            Practice Now
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
