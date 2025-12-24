"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, Variants } from "framer-motion";
import { Check, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "5 interviews per month",
      "Basic AI interviewer",
      "Code execution",
      "Limited test cases",
      "Community support",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "Most popular for serious prep",
    badge: "POPULAR",
    features: [
      "Unlimited interviews",
      "Advanced AI interviewer",
      "All programming languages",
      "Unlimited test cases",
      "System design practice",
      "Performance analytics",
      "Priority support",
      "Interview history",
      "Custom difficulty levels",
    ],
    cta: "Start 7-Day Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For teams and organizations",
    features: [
      "Everything in Pro",
      "Custom integrations",
      "Dedicated account manager",
      "SSO & advanced security",
      "Team analytics",
      "Bulk licenses",
      "Custom branding",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
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

export function Pricing() {
  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-primary/5 blur-[120px] rounded-full" />
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
            <Zap className="h-3.5 w-3.5 mr-1.5 text-primary" />
            Pricing
          </Badge>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Simple,{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Transparent Pricing
            </span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your interview preparation journey.
            Start free, upgrade when you&apos;re ready.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-start"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`relative ${
                plan.highlighted ? "md:-mt-4 md:mb-4" : ""
              }`}
            >
              {/* Glow effect for highlighted plan */}
              {plan.highlighted && (
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-3xl blur-lg opacity-30 animate-pulse" />
              )}

              <div
                className={cn(
                  "relative h-full p-8 rounded-2xl border transition-all duration-500 flex flex-col overflow-hidden",
                  plan.highlighted
                    ? "border-primary/50 bg-gradient-to-b from-primary/10 via-card to-card shadow-2xl shadow-primary/10"
                    : "border-border bg-card hover:border-primary/30 hover:shadow-lg dark:border-white/10 dark:bg-card/50 dark:backdrop-blur-md dark:hover:border-white/20 dark:hover:bg-card/70"
                )}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-px left-1/2 -translate-x-1/2">
                    <div className="px-4 py-1 bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-semibold rounded-b-lg flex items-center gap-1.5 shadow-lg">
                      <Sparkles className="h-3 w-3" />
                      {plan.badge}
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center pb-8 pt-4">
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>

                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span
                      className={`font-bold tracking-tight ${
                        plan.highlighted ? "text-5xl" : "text-4xl"
                      }`}
                    >
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-sm text-muted-foreground">
                        /{plan.period}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-4 flex-1 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-0.5 rounded-full p-1",
                          plan.highlighted
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  asChild
                  className={cn(
                    "w-full h-12 text-base font-medium transition-all duration-300",
                    plan.highlighted
                      ? "bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40"
                      : "bg-secondary hover:bg-secondary/80 text-foreground border border-border"
                  )}
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  <Link
                    href={plan.name === "Enterprise" ? "/contact" : "/signup"}
                  >
                    {plan.cta}
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Message */}
        <motion.div
          className="text-center mt-12 space-y-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-sm text-muted-foreground">
            All plans include a 7-day money-back guarantee
          </p>
          <p className="text-xs text-muted-foreground/70">
            No credit card required for Free plan • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}
