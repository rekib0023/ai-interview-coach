import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Clock,
  Download,
  Eye,
  Minus,
  MoreVertical,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface Interview {
  id: number;
  topic: string;
  date: string;
  difficulty: "Easy" | "Medium" | "Hard";
  score: number;
  duration?: string;
  trend?: "up" | "down" | "same";
}

interface RecentSessionsTableProps {
  interviews: Interview[];
  onViewDetails?: (id: number) => void;
  onViewAnalytics?: (id: number) => void;
}

interface DashboardRecentSessionsSectionProps {
  interviews: Interview[];
  onViewAll?: () => void;
}

const difficultyConfig = {
  Easy: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  Medium: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  Hard: {
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
};

function getScoreColor(score: number) {
  if (score >= 85) return "text-emerald-600";
  if (score >= 70) return "text-amber-600";
  return "text-rose-600";
}

export function DashboardRecentSessionsSection({
  interviews,
  onViewAll,
}: DashboardRecentSessionsSectionProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Recent Sessions</h2>
          <p className="text-sm text-muted-foreground">
            Review your latest interview performance
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-muted-foreground hover:text-foreground -mt-1"
          onClick={onViewAll}
        >
          <span className="text-sm">View All</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Table */}
      {interviews.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Desktop View */}
          <div className="hidden md:block rounded-lg border bg-card overflow-hidden">
            {/* Table Header */}
            <div className="bg-muted/30 px-6 py-3 border-b">
              <div className="grid grid-cols-12 gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <div className="col-span-4">Topic</div>
                <div className="col-span-3">Date & Time</div>
                <div className="col-span-2">Difficulty</div>
                <div className="col-span-2 text-right">Score</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>
            </div>

            {/* Table Body */}
            <div>
              {interviews.map((interview, index) => (
                <motion.div
                  key={interview.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                >
                  <DesktopSessionRow
                    interview={interview}
                    index={index}
                    totalRows={interviews.length}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-3">
            {interviews.map((interview, index) => (
              <motion.div
                key={interview.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
              >
                <MobileSessionCard interview={interview} />
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Desktop Row Component
function DesktopSessionRow({
  interview,
  index,
  totalRows,
}: {
  interview: Interview;
  index: number;
  totalRows: number;
}) {
  const isLast = index === totalRows - 1;

  return (
    <div
      className={cn(
        "group hover:bg-muted/50 transition-colors",
        !isLast && "border-b"
      )}
    >
      <div className="grid grid-cols-12 gap-4 items-center px-6 py-4">
        {/* Topic */}
        <div className="col-span-4 flex items-center gap-3 min-w-0">
          <span
            className={cn(
              "h-2 w-2 rounded-full flex-shrink-0",
              difficultyConfig[interview.difficulty].dot
            )}
          />
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{interview.topic}</p>
            {interview.duration && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Clock className="h-3 w-3" />
                {interview.duration}
              </p>
            )}
          </div>
        </div>

        {/* Date & Time */}
        <div className="col-span-3 text-sm text-muted-foreground">
          {interview.date}
        </div>

        {/* Difficulty */}
        <div className="col-span-2">
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-medium",
              difficultyConfig[interview.difficulty].badge
            )}
          >
            {interview.difficulty}
          </Badge>
        </div>

        {/* Score */}
        <div className="col-span-2 flex items-center justify-end gap-2">
          {interview.trend && (
            <>
              {interview.trend === "up" && (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              )}
              {interview.trend === "down" && (
                <TrendingDown className="h-4 w-4 text-rose-500" />
              )}
              {interview.trend === "same" && (
                <Minus className="h-4 w-4 text-muted-foreground" />
              )}
            </>
          )}
          <span
            className={cn(
              "text-sm font-semibold",
              getScoreColor(interview.score)
            )}
          >
            {interview.score}%
          </span>
        </div>

        {/* Actions */}
        <div className="col-span-1 flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            asChild
          >
            <Link href={`/dashboard/sessions/${interview.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/sessions/${interview.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/analytics/${interview.id}`}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export Session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

// Mobile Card Component
function MobileSessionCard({ interview }: { interview: Interview }) {
  return (
    <div className="rounded-lg border bg-card p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span
            className={cn(
              "h-2 w-2 rounded-full flex-shrink-0",
              difficultyConfig[interview.difficulty].dot
            )}
          />
          <h3 className="font-medium text-sm truncate">{interview.topic}</h3>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/sessions/${interview.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/analytics/${interview.id}`}>
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Download className="mr-2 h-4 w-4" />
              Export Session
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
        <span>{interview.date}</span>
        {interview.duration && (
          <>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {interview.duration}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Badge
          variant="outline"
          className={cn(
            "text-xs font-medium",
            difficultyConfig[interview.difficulty].badge
          )}
        >
          {interview.difficulty}
        </Badge>

        <div className="flex items-center gap-2">
          {interview.trend && (
            <>
              {interview.trend === "up" && (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              )}
              {interview.trend === "down" && (
                <TrendingDown className="h-4 w-4 text-rose-500" />
              )}
              {interview.trend === "same" && (
                <Minus className="h-4 w-4 text-muted-foreground" />
              )}
            </>
          )}
          <span
            className={cn(
              "text-sm font-semibold",
              getScoreColor(interview.score)
            )}
          >
            {interview.score}%
          </span>
        </div>
      </div>
    </div>
  );
}

// Empty State
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center border rounded-lg bg-muted/20">
      <div className="rounded-full bg-muted p-4 mb-4">
        <BarChart3 className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold mb-1">No sessions yet</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Start your first interview to see your progress here
      </p>
      <Button>Start Interview</Button>
    </div>
  );
}
