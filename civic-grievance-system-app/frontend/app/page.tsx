"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Search, FileText, BarChart3, Shield, Zap, Users } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { GlassCard } from "@/components/glass-card"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const features = [
  {
    icon: FileText,
    title: "Easy Submission",
    description: "Submit grievances in minutes with our intuitive form system supporting multiple categories.",
  },
  {
    icon: Search,
    title: "Real-time Tracking",
    description: "Track your grievance status in real-time with detailed progress updates.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Comprehensive analytics for administrators to monitor and optimize resolution times.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data is protected with enterprise-grade security and privacy compliance.",
  },
  {
    icon: Zap,
    title: "AI-Powered Routing",
    description: "Intelligent routing ensures your grievance reaches the right department instantly.",
  },
  {
    icon: Users,
    title: "Multi-stakeholder",
    description: "Connect citizens, officials, and departments on a single unified platform.",
  },
]

const stats = [
  { value: "AI", label: "Priority scoring" },
  { value: "Live", label: "Status tracking" },
  { value: "Map", label: "Geo dashboards" },
  { value: "CSV", label: "Admin exports" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <main className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <section className="mx-auto max-w-7xl px-6 pt-32 pb-20 md:pt-40 md:pb-32">
          <motion.div
            className="flex flex-col items-center text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Now serving all 28 states
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="max-w-4xl text-balance text-4xl font-semibold tracking-tight text-foreground md:text-6xl lg:text-7xl"
            >
              Your voice matters.{" "}
              <span className="text-primary">We make it heard.</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-6 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl"
            >
              CivicSync empowers citizens across India to submit, track, and resolve civic grievances efficiently. A modern platform connecting you directly with the right authorities.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
            >
              <Link
                href="/login?next=/submit"
                className="group flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-medium text-primary-foreground transition-all hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Submit Grievance
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login?next=/grievances"
                className="flex items-center gap-2 rounded-2xl border border-border bg-background px-8 py-4 text-base font-medium text-foreground transition-all hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Search className="h-4 w-4" />
                Track Status
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-border/40 bg-secondary/30">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <motion.div
              className="grid grid-cols-2 gap-8 md:grid-cols-4"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  className="text-center"
                >
                  <div className="text-3xl font-semibold text-foreground md:text-4xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Everything you need
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A comprehensive platform designed for citizens and administrators alike.
            </p>
          </motion.div>

          <motion.div
            className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={itemVariants}>
                <GlassCard hover className="h-full">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    {feature.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* CTA Section */}
        <section id="about" className="mx-auto max-w-7xl px-6 pb-24 md:pb-32">
          <GlassCard className="relative overflow-hidden p-8 md:p-12">
            <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <h2 className="max-w-2xl text-balance text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                Ready to make your community better?
              </h2>
              <p className="mt-4 max-w-xl text-muted-foreground">
                Join millions of citizens who have already used CivicSync to resolve their grievances and improve their communities.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
                <Link
                  href="/login"
                  className="group flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-medium text-primary-foreground transition-all hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/admin"
                  className="rounded-2xl border border-border bg-background px-8 py-4 text-base font-medium text-foreground transition-all hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Admin Console
                </Link>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/40">
          <div className="mx-auto max-w-7xl px-6 py-12">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4 text-primary-foreground"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 2L2 7l10 5 10-5-10-5z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2 17l10 5 10-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2 12l10 5 10-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-lg font-semibold text-foreground">CivicSync</span>
              </div>
              <p className="text-sm text-muted-foreground">
                © 2026 CivicSync. A Government of India Initiative.
              </p>
              <div className="flex items-center gap-6">
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Sign in
                </Link>
                <Link
                  href="/submit"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Submit
                </Link>
                <Link
                  href="/grievances"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Track
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
