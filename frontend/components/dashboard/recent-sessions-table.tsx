import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Code2, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Interview {
  id: number;
  topic: string;
  date: string;
  difficulty: string;
  score: number;
}

interface RecentSessionsTableProps {
  interviews: Interview[];
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "bg-green-100 text-green-700 border-green-200";
    case "medium":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "hard":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-stone-100 text-stone-700 border-stone-200";
  }
}

export function RecentSessionsTable({ interviews }: RecentSessionsTableProps) {
  return (
    <Card className="border-stone-200 mb-8">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold text-stone-900">
          Recent Sessions
        </CardTitle>
        <Link
          href="/dashboard/history"
          className="text-sm text-blue-600 hover:underline"
        >
          View All
        </Link>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-stone-500 uppercase tracking-wide border-b border-stone-200">
                <th className="pb-3 pr-4">Topic</th>
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">Difficulty</th>
                <th className="pb-3 pr-4">Score</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {interviews.map((interview) => (
                <tr key={interview.id} className="text-sm">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Code2 className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-stone-900">
                        {interview.topic}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 pr-4 text-stone-500">{interview.date}</td>
                  <td className="py-4 pr-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        getDifficultyColor(interview.difficulty)
                      )}
                    >
                      {interview.difficulty}
                    </Badge>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="font-semibold text-stone-900">
                      {interview.score}%
                    </span>
                  </td>
                  <td className="py-4">
                    <Button variant="outline" size="sm" className="gap-1">
                      <ExternalLink className="h-3 w-3" />
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
