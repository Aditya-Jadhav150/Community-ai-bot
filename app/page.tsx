"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Map, ShieldCheck, Zap, Activity, Users, MapPin } from "lucide-react";

const features = [
  {
    title: "AI Analysis",
    description: "Upload a photo and let our AI classify the issue, severity, and department instantly.",
    icon: <Zap className="w-6 h-6 text-[#00FFE0]" />,
  },
  {
    title: "Live Interactive Map",
    description: "See all community issues plotted in real-time with severity heatmaps.",
    icon: <MapPin className="w-6 h-6 text-[#00AEFF]" />,
  },
  {
    title: "Community Validation",
    description: "Upvote and verify issues reported by others to ensure accurate prioritization.",
    icon: <Users className="w-6 h-6 text-[#9B5DE5]" />,
  },
  {
    title: "Predictive AI",
    description: "Forecast future hotspots based on historical data to prevent recurring issues.",
    icon: <Activity className="w-6 h-6 text-[#FF9500]" />,
  },
  {
    title: "Gamification",
    description: "Earn XP, level up, and unlock achievements for making your community better.",
    icon: <ShieldCheck className="w-6 h-6 text-[#30D158]" />,
  },
];

export default function LandingPage() {
  const headline = "Empowering Communities Through AI";

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#00AEFF]/20 via-background to-background" />

        <motion.h1
          className="text-5xl md:text-7xl font-black mb-6 tracking-tight"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.08 } },
            hidden: {},
          }}
        >
          {headline.split(" ").map((word, i) => (
            <motion.span
              key={i}
              className="inline-block mr-3 animate-gradient-text"
              variants={{
                visible: { opacity: 1, y: 0 },
                hidden: { opacity: 0, y: 20 },
              }}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Report, verify, and solve local issues with intelligent automation.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Link href="/report">
            <Button size="lg" className="bg-[#00AEFF] hover:bg-[#00AEFF]/80 text-white text-lg h-14 px-8 rounded-full">
              Report an Issue <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/map">
            <Button size="lg" variant="outline" className="text-lg h-14 px-8 rounded-full border-white/20 hover:bg-white/5">
              Explore Map <Map className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Live Counter Row */}
      <section className="py-12 border-y border-white/10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-around gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-[#00AEFF]">1,284</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider mt-1">Issues Reported</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-[#30D158]">847</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider mt-1">Resolved</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-[#9B5DE5]">96</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider mt-1">Active Cities</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass-card p-6 h-full hover:scale-[1.02] transition-transform duration-300 hover:shadow-[0_0_30px_rgba(0,174,255,0.15)] cursor-default">
                <div className="mb-4 p-3 bg-white/5 rounded-xl inline-block">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 text-center text-muted-foreground">
        <p>© 2026 Community Hero AI. Built for the Hackathon.</p>
      </footer>
    </div>
  );
}
