"use client";

import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  BarChart3,
  Brain,
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
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: Code2,
    title: "Live Code Editor",
    description:
      "Write, test, and execute code in real-time with support for Python, JavaScript, Java, C++, and more languages.",
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-500/10",
    iconColor: "text-violet-500",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description:
      "Track your progress with detailed metrics, identify weak areas, and see your improvement over time.",
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    icon: GitBranch,
    title: "System Design Whiteboard",
    description:
      "Practice architectural interviews with interactive whiteboarding tools and get AI-powered feedback on your designs.",
    color: "from-orange-500 to-amber-500",
    bgColor: "bg-orange-500/10",
    iconColor: "text-orange-500",
  },
  {
    icon: Brain,
    title: "Smart Feedback",
    description:
      "Receive instant, actionable feedback on your code quality, time complexity, space complexity, and communication skills.",
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-500/10",
    iconColor: "text-pink-500",
  },
  {
    icon: Zap,
    title: "Real-time Execution",
    description:
      "Run test cases instantly with our optimized execution engine. See results in milliseconds, not minutes.",
    color: "from-yellow-500 to-orange-500",
    bgColor: "bg-yellow-500/10",
    iconColor: "text-yellow-600",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.21, 0.47, 0.32, 0.98],
    },
  },
};

export function Features() {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <motion.div
          className="text-center space-y-6 mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Badge
            variant="outline"
            className="px-4 py-1.5 text-sm border-primary/30 bg-primary/10"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
            Features
          </Badge>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl mx-auto">
            New and improved way of{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              interview prep
            </span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools and features designed to help you prepare for
            technical interviews at top tech companies.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative"
              >
                {/* Card */}
                <div className="relative h-full p-6 rounded-2xl border border-border bg-card transition-all duration-500 hover:border-primary/30 hover:shadow-lg dark:border-white/10 dark:bg-card/50 dark:backdrop-blur-md dark:hover:border-white/20 dark:hover:bg-card/70 overflow-hidden">
                  {/* Gradient background on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  />

                  {/* Glow effect */}
                  <div
                    className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${feature.color} blur-3xl opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-500`}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div
                      className={`inline-flex h-14 w-14 items-center justify-center rounded-xl ${feature.bgColor} mb-5 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className={`h-7 w-7 ${feature.iconColor}`} />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold mb-3 text-foreground">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Feature Highlight */}
        <motion.div
          className="mt-16 relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="relative p-8 md:p-12 rounded-3xl border border-border bg-card dark:border-white/10 dark:bg-gradient-to-br dark:from-card/80 dark:via-card/50 dark:to-card/80 dark:backdrop-blur-xl overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 blur-3xl rounded-full" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/10 blur-3xl rounded-full" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
                  <Target className="h-10 w-10 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-bold mb-3">
                  Personalized Learning Path
                </h3>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Our AI adapts to your learning style and pace, creating a
                  customized interview prep path tailored to your target
                  companies and role. Focus on what matters most for your
                  success.
                </p>
              </div>

              {/* Stats */}
              <div className="flex-shrink-0 flex gap-8">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary">
                    85%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Success Rate
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary">
                    2x
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Faster Prep
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
