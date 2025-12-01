"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Star, Award } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  {
    icon: Users,
    value: "10,000+",
    label: "Active Users",
    description: "Developers practicing daily",
  },
  {
    icon: Award,
    value: "500+",
    label: "Success Stories",
    description: "Developers hired at FAANG",
  },
  {
    icon: Star,
    value: "4.9/5",
    label: "User Rating",
    description: "Based on 2,000+ reviews",
  },
  {
    icon: TrendingUp,
    value: "85%",
    label: "Success Rate",
    description: "Users pass their interviews",
  },
];

export function Stats() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.21, 0.47, 0.32, 0.98],
                }}
              >
                <Card className="border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 h-full bg-card/50 backdrop-blur-sm group">
                  <CardContent className="pt-8 pb-8">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <motion.div
                        className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Icon className="h-7 w-7 text-primary/80 group-hover:text-primary transition-colors" />
                      </motion.div>
                      <motion.div
                        className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          delay: index * 0.1 + 0.3,
                          type: "spring",
                          stiffness: 200,
                        }}
                      >
                        {stat.value}
                      </motion.div>
                      <div className="font-semibold text-lg text-foreground/80">
                        {stat.label}
                      </div>
                      <div className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
                        {stat.description}
                      </div>
                    </div>
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
