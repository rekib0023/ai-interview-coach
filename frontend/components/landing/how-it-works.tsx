"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Choose Your Path",
    description:
      "Select from algorithms, system design, or behavioral interviews. Pick your difficulty level and programming language.",
  },
  {
    number: "02",
    title: "Start Interview",
    description:
      "Engage with our AI interviewer who asks realistic questions and adapts based on your responses and skill level.",
  },
  {
    number: "03",
    title: "Code & Execute",
    description:
      "Write code in our powerful editor, run test cases, and get instant feedback on your solution's correctness and efficiency.",
  },
  {
    number: "04",
    title: "Get Feedback",
    description:
      "Receive detailed analysis on your performance including strengths, areas for improvement, and actionable next steps.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <motion.div
          className="text-center space-y-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="secondary" className="px-4 py-2 text-sm">
            Simple Process
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started with AI Interview Coach in four simple steps
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
            >
              <Card className="relative border hover:border-primary/30 transition-all hover:shadow-md h-full group">
                <CardContent className="pt-8 pb-8">
                  <div className="text-7xl font-bold text-muted-foreground/20 mb-6 group-hover:text-muted-foreground/30 transition-colors">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
