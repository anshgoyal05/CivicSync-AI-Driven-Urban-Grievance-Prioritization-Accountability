import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

import { FadeIn } from "@/components/Motion";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute -top-24 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-sky-500/15 blur-3xl" />
      <div className="absolute -bottom-24 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <FadeIn>
            <p className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-xs font-semibold text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-200">
              <Sparkles size={14} /> AI Prioritization + Accountability
            </p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
              CivicSync: AI-Driven Urban Grievance Prioritization & Accountability
            </h1>
            <p className="mt-4 text-zinc-600 dark:text-zinc-300">
              Submit complaints with location and evidence. The system predicts priority
              using text + image analysis, assigns departments automatically, and helps
              administrators resolve issues transparently with audit trails.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
              >
                Submit a grievance <ArrowRight size={16} />
              </Link>
              <Link
                href="/grievances"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
              >
                Track your complaints
              </Link>
            </div>
          </FadeIn>
          <FadeIn delay={0.05} className="rounded-3xl border border-zinc-200/70 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-950/70">
            <div className="grid gap-4">
              <Feature
                icon={<TrendingUp size={18} />}
                title="Prioritization that makes sense"
                desc="Text severity + image signals + keyword risk boost → Low/Medium/High/Critical with confidence + explanation."
              />
              <Feature
                icon={<ShieldCheck size={18} />}
                title="Accountability by design"
                desc="Admin status changes create an audit log for every complaint, enabling traceable resolution."
              />
              <Feature
                icon={<Sparkles size={18} />}
                title="Smart city analytics"
                desc="Region/department dashboards, priority distribution, and monthly trends for governance decisions."
              />
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="group flex gap-3 rounded-2xl border border-zinc-200/70 bg-white/80 p-4 transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/70 dark:hover:border-sky-800">
      <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600/10 text-sky-700 dark:text-sky-300">
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{desc}</div>
      </div>
    </div>
  );
}
