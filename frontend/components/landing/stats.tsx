"use client";

import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { Award, Star, TrendingUp, Users } from "lucide-react";
import { useEffect, useRef } from "react";

const stats = [
  {
    icon: Users,
    value: 10000,
    suffix: "+",
    label: "Active Users",
    description: "Developers practicing daily",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Award,
    value: 500,
    suffix: "+",
    label: "Success Stories",
    description: "Developers hired at FAANG",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Star,
    value: 4.9,
    suffix: "/5",
    label: "User Rating",
    description: "Based on 2,000+ reviews",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: TrendingUp,
    value: 85,
    suffix: "%",
    label: "Success Rate",
    description: "Users pass their interviews",
    color: "from-emerald-500 to-teal-500",
  },
];

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const spring = useSpring(0, {
    mass: 0.8,
    stiffness: 75,
    damping: 15,
  });

  const display = useTransform(spring, (current) => {
    if (value < 10) {
      return current.toFixed(1);
    }
    return Math.round(current).toLocaleString();
  });

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, spring, value]);

  return (
    <span ref={ref}>
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
}

export function Stats() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-muted/30" />
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
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
                className="group"
              >
                <div className="relative h-full p-6 lg:p-8 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-md transition-all duration-500 hover:border-white/20 hover:bg-card/70 overflow-hidden text-center">
                  {/* Gradient glow on hover */}
                  <div
                    className={`absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-gradient-to-br ${stat.color} blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
                  />

                  <div className="relative z-10 flex flex-col items-center gap-4">
                    {/* Icon */}
                    <motion.div
                      className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 5 }}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </motion.div>

                    {/* Value */}
                    <div className="text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                      <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                    </div>

                    {/* Label */}
                    <div className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                      {stat.label}
                    </div>

                    {/* Description */}
                    <div className="text-sm text-muted-foreground">
                      {stat.description}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
