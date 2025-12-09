"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Software Engineer",
    company: "Google",
    avatar: "SC",
    avatarColor: "bg-blue-500",
    content:
      "After 3 months of using AI Interview Coach, I went from failing my first Google interview to getting an L4 offer. The AI feedback on my system design answers was incredibly detailed — it caught things I never would have noticed on my own.",
    highlight: "Google L4 Offer",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Senior Engineer",
    company: "Meta",
    avatar: "MJ",
    avatarColor: "bg-purple-500",
    content:
      "The mock interviews feel incredibly realistic. I practiced 50+ sessions and by the end, the real Meta interview felt easier than my practice sessions. The personalized learning path identified my weakness in dynamic programming early on.",
    highlight: "Meta E5 Offer",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "Full Stack Developer",
    company: "Amazon",
    avatar: "PS",
    avatarColor: "bg-orange-500",
    content:
      "I was skeptical about AI interview prep, but this changed my mind. The code execution and instant feedback loop helped me improve my problem-solving speed by 40%. Got offers from Amazon and two other companies!",
    highlight: "Amazon SDE II Offer",
    rating: 5,
  },
  {
    name: "David Kim",
    role: "Backend Engineer",
    company: "Stripe",
    avatar: "DK",
    avatarColor: "bg-green-500",
    content:
      "What sets this apart is the behavioral interview prep. The AI helped me structure my stories using STAR format and gave me confidence I never had. Landed my dream job at Stripe with a 30% salary increase.",
    highlight: "Stripe Offer + 30% Raise",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "ML Engineer",
    company: "OpenAI",
    avatar: "ER",
    avatarColor: "bg-pink-500",
    content:
      "The system design whiteboard feature is a game-changer. I could practice designing ML pipelines and get feedback on scalability concerns. Exactly what I needed for my OpenAI interview.",
    highlight: "OpenAI Offer",
    rating: 5,
  },
  {
    name: "Alex Thompson",
    role: "New Grad",
    company: "Microsoft",
    avatar: "AT",
    avatarColor: "bg-cyan-500",
    content:
      "As a bootcamp grad with no CS degree, I was intimidated by technical interviews. This platform taught me DSA from scratch and helped me land a Microsoft offer 6 months after starting to code. Life-changing.",
    highlight: "Microsoft New Grad Offer",
    rating: 5,
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

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
        <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full -translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-accent/5 blur-[150px] rounded-full -translate-y-1/2" />
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <motion.div
          className="text-center space-y-6 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Badge
            variant="outline"
            className="px-4 py-1.5 text-sm border-primary/30 bg-primary/10"
          >
            <Star className="h-3.5 w-3.5 mr-1.5 text-primary fill-primary" />
            Success Stories
          </Badge>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Engineers who landed their{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              dream jobs
            </span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of developers who transformed their careers with
            AI-powered interview preparation.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300 dark:border-white/10 dark:bg-card/50 dark:backdrop-blur-md dark:hover:border-white/20">
                <CardContent className="p-6 flex flex-col h-full">
                  {/* Quote icon */}
                  <Quote className="h-8 w-8 text-primary/20 mb-4" />

                  {/* Content */}
                  <p className="text-muted-foreground leading-relaxed flex-1 mb-6">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>

                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 text-yellow-500 fill-yellow-500"
                      />
                    ))}
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-full ${testimonial.avatarColor} flex items-center justify-center text-white font-semibold`}
                    >
                      {testimonial.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role} @ {testimonial.company}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400"
                    >
                      {testimonial.highlight}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom stats */}
        <motion.div
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 p-8 rounded-2xl border border-border bg-card/50 dark:border-white/10 dark:bg-card/30"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary">
              10,000+
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Engineers Trained
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary">
              85%
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Interview Success Rate
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary">
              500+
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Companies Hired From
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary">
              4.9/5
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Average Rating
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
