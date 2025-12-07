import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export function DashboardAiInsight() {
  return (
    <Card className="border-none bg-muted/30">
      <CardContent className="flex items-center gap-4 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="mb-0.5 text-sm font-semibold">AI Insight</h3>
          <p className="text-sm text-muted-foreground">
            You've improved significantly in <strong>System Design</strong> this
            week! Consider tackling <strong>Dynamic Programming</strong> next
            for balanced growth.
          </p>
        </div>
        <Button variant="ghost" size="sm" className="shrink-0 gap-2">
          Practice Now
        </Button>
      </CardContent>
    </Card>
  );
}
