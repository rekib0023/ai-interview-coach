"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Sparkles } from "lucide-react";
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
      "Priority support",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Simple,{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Transparent Pricing
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your interview preparation journey
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card
              key={index}
              className={`relative border transition-all duration-300 ${
                plan.highlighted
                  ? "border-primary shadow-2xl scale-105 md:scale-110 z-10"
                  : "border-border/50 hover:border-primary/20 hover:shadow-lg bg-card/50 backdrop-blur-sm"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-8">
                {/* Plan name */}
                <CardTitle className="text-2xl font-semibold tracking-tight mb-1">
                  {plan.name}
                </CardTitle>

                {/* Price as primary focal point */}
                <div className="mt-2 flex items-baseline justify-center gap-2">
                  <span
                    className={
                      plan.name === "Pro"
                        ? "text-5xl font-bold"
                        : "text-4xl font-bold"
                    }
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground">
                      / {plan.period}
                    </span>
                  )}
                </div>

                {/* Subtitle / supporting text */}
                <CardDescription className="mt-3">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features List */}
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  asChild
                  className={`w-full h-12 text-base ${
                    plan.highlighted
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : ""
                  }`}
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  <Link
                    href={plan.name === "Enterprise" ? "/contact" : "/signup"}
                  >
                    {plan.cta}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Message */}
        <p className="text-center mt-12 space-y-1">
          <span className="block text-sm font-medium text-muted-foreground">
            All plans include a 7-day money-back guarantee
          </span>
          <span className="block text-xs text-muted-foreground">
            No credit card required for Free plan
          </span>
        </p>
      </div>
    </section>
  );
}
