import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface Skill {
  name: string;
  progress: number;
}

interface SkillProgressCardProps {
  title: string;
  skills: Skill[];
  icon: LucideIcon;
  iconColor: string;
  progressColor?: string;
}

export function SkillProgressCard({
  title,
  skills,
  icon: Icon,
  iconColor,
  progressColor,
}: SkillProgressCardProps) {
  return (
    <Card className="border-stone-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-stone-900 flex items-center gap-2">
          <Icon className={`h-5 w-5 ${iconColor}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {skills.map((skill) => (
          <div key={skill.name}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-stone-700">
                {skill.name}
              </span>
              <span className="text-sm text-stone-500">{skill.progress}%</span>
            </div>
            <Progress
              value={skill.progress}
              className={cn(
                "h-2 bg-stone-100",
                progressColor && `[&>div]:${progressColor}`
              )}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
