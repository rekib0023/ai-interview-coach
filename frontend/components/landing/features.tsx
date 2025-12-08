"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  BarChart3,
  Brain,
  Clock,
  Code2,
  GitBranch,
  MessageSquare,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "AI Interviewer Chat",
    description:
      "Engage in realistic technical interviews with an AI that adapts to your skill level and provides contextual questions.",
    gradient: "from-teal-500 to-cyan-500",
  },
  {
    icon: Code2,
    title: "Live Code Editor",
    description:
      "Write, test, and execute code in real-time with support for Python, JavaScript, Java, C++, and more languages.",
    gradient: "from-cyan-500 to-emerald-500",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description:
      "Track your progress with detailed metrics, identify weak areas, and see your improvement over time.",
    gradient: "from-teal-500 to-cyan-500",
  },
  {
    icon: GitBranch,
    title: "System Design Whiteboard",
    description:
      "Practice architectural interviews with interactive whiteboarding tools and get AI-powered feedback on your designs.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Brain,
    title: "Smart Feedback",
    description:
      "Receive instant, actionable feedback on your code quality, time complexity, space complexity, and communication skills.",
    gradient: "from-teal-600 to-cyan-600",
  },
  {
    icon: Zap,
    title: "Real-time Execution",
    description:
      "Run test cases instantly with our optimized execution engine. See results in milliseconds, not minutes.",
    gradient: "from-cyan-500 to-emerald-500",
  },
  {
    icon: Target,
    title: "Targeted Practice",
    description:
      "Focus on specific topics like algorithms, data structures, or system design with curated problem sets.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Clock,
    title: "Interview Simulation",
    description:
      "Practice under real interview conditions with time limits, pressure scenarios, and realistic follow-up questions.",
    gradient: "from-teal-500 to-cyan-500",
  },
  {
    icon: Sparkles,
    title: "Personalized Learning",
    description:
      "AI adapts to your learning style and pace, creating a customized interview prep path just for you.",
    gradient: "from-cyan-600 to-emerald-600",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <motion.div
          className="text-center space-y-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Ace Your Interview
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools and features designed to help you prepare for
            technical interviews at top tech companies.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.21, 0.47, 0.32, 0.98],
                }}
              >
                <Card className="h-full group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20 hover:-translate-y-1 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <div
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${feature.gradient} mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
