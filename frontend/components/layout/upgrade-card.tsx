import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function UpgradeCard() {
  return (
    <Card className="w-full">
      <CardHeader className="px-5 pt-0">
        <CardTitle className="text-lg font-semibold text-slate-900">
          Upgrade Your Plan
        </CardTitle>
        <CardDescription className="text-sm text-slate-600">
          Your trial plan ends in 12 days. Upgrade now and unlock the full
          potential!
        </CardDescription>
      </CardHeader>
      <CardContent className="px-5">
        <Progress value={60} className="h-3 bg-slate-200" />
      </CardContent>
      <CardFooter className="px-5">
        <Button className="w-full">See All Plans</Button>
      </CardFooter>
    </Card>
  );
}
