"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateAssessment } from "@/hooks/use-assessment";
import { type DifficultyLevel, type AssessmentCreate } from "@/lib/assessment-api";
import { cn } from "@/lib/utils";
import { Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AssessmentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const DIFFICULTY_OPTIONS: {
  value: DifficultyLevel;
  label: string;
  color: string;
}[] = [
  {
    value: "Easy",
    label: "Easy",
    color:
      "bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30",
  },
  {
    value: "Medium",
    label: "Medium",
    color:
      "bg-yellow-500/20 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30",
  },
  {
    value: "Hard",
    label: "Hard",
    color: "bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30",
  },
];

const SUGGESTED_TOPICS = [
  "System Design",
  "Data Structures",
  "Behavioral Interview",
  "Problem Solving",
  "SQL & Databases",
  "Object-Oriented Design",
];

const SUGGESTED_ROLES = [
  "Software Engineer",
  "Data Scientist",
  "Product Manager",
  "DevOps Engineer",
  "Frontend Developer",
  "Backend Developer",
];

export function AssessmentForm({ onSuccess, onCancel }: AssessmentFormProps) {
  const router = useRouter();
  const { createAssessment, isLoading, error } = useCreateAssessment();

  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("Medium");
  const [role, setRole] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [question, setQuestion] = useState("");

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!topic.trim()) return;

    const data: AssessmentCreate = {
      topic: topic.trim(),
      difficulty,
      role: role.trim() || undefined,
      skill_targets: skills.length > 0 ? skills : undefined,
      question: question.trim() || undefined,
    };

    try {
      const assessment = await createAssessment(data);
      onSuccess?.();
      router.push(`/assessment/${assessment.id}`);
    } catch (err) {
      console.error("Failed to create assessment:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Topic */}
      <div className="space-y-2">
        <Label htmlFor="topic">Topic *</Label>
        <Input
          id="topic"
          placeholder="e.g., System Design, Behavioral Interview"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="bg-white/5 border-white/10"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {SUGGESTED_TOPICS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTopic(t)}
              className={cn(
                "px-3 py-1 text-xs rounded-full border transition-colors",
                topic === t
                  ? "bg-primary/20 border-primary/50 text-primary"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="space-y-2">
        <Label>Difficulty *</Label>
        <div className="flex gap-3">
          {DIFFICULTY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setDifficulty(option.value)}
              className={cn(
                "flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all",
                difficulty === option.value
                  ? option.color
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Role */}
      <div className="space-y-2">
        <Label htmlFor="role">Target Role (optional)</Label>
        <Input
          id="role"
          placeholder="e.g., Software Engineer, Data Scientist"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="bg-white/5 border-white/10"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {SUGGESTED_ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={cn(
                "px-3 py-1 text-xs rounded-full border transition-colors",
                role === r
                  ? "bg-primary/20 border-primary/50 text-primary"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-2">
        <Label>Target Skills (optional)</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add a skill"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddSkill();
              }
            }}
            className="bg-white/5 border-white/10"
          />
          <Button type="button" variant="outline" onClick={handleAddSkill}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-primary/20 border border-primary/30"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Custom Question */}
      <div className="space-y-2">
        <Label htmlFor="question">Custom Question (optional)</Label>
        <textarea
          id="question"
          placeholder="Enter a specific question to practice, or leave blank for AI-generated questions"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
      </div>

      {/* Error */}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading || !topic.trim()}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Start Assessment
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
