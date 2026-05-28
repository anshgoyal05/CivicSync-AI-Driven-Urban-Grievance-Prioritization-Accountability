"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { RequireAuth } from "@/components/RequireAuth"
import { GrievanceMiniMap } from "@/components/grievance-mini-map"
import { useAuth } from "@/lib/auth"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  Filter,
  Download,
  ChevronDown,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: true },
  { icon: FileText, label: "Grievances", href: "/admin" },
  { icon: Users, label: "Citizens", href: "/grievances" },
  { icon: BarChart3, label: "Reports", href: "/admin" },
  { icon: Settings, label: "Settings", href: "/login" },
]

const statIcons = [FileText, Clock, CheckCircle2, TrendingDown]

const statusColors: Record<string, string> = {
  "Pending": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "In Progress": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "Resolved": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
}

const priorityColors: Record<string, string> = {
  Critical: "text-red-700 dark:text-red-400",
  High: "text-red-600 dark:text-red-400",
  Medium: "text-amber-600 dark:text-amber-400",
  Low: "text-emerald-600 dark:text-emerald-400",
}

export default function DashboardPage() {
  return (
    <RequireAuth role="admin">
      <DashboardInner />
    </RequireAuth>
  )
}

function DashboardInner() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("All")
  const { user, logout } = useAuth()
  const router = useRouter()
  const {
    loading,
    stats,
    rows,
    total,
    allTotal,
    analytics,
    grievances: mapGrievances,
    search,
    setSearch,
    exportCsv,
    regionChart,
  } = useDashboardData()

  const grievances = rows.filter(
    (g) => selectedFilter === "All" || g.status === selectedFilter,
  )

  const chartData = analytics?.monthly_trend ?? []

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-border/40 bg-card/50 backdrop-blur-xl lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b border-border/40 px-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5 text-primary-foreground"
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

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  item.active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User */}
          <div className="border-t border-border/40 p-4">
            <div className="flex items-center gap-3 rounded-xl bg-secondary/50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-sm font-semibold">
                  {(user?.name ?? "A")
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              </div>
              <div className="flex-1 truncate">
                <p className="truncate text-sm font-medium text-foreground">
                  {user?.name ?? "Admin"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email ?? ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout()
                  router.push("/login")
                }}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <motion.aside
            className="absolute left-0 top-0 h-full w-64 border-r border-border/40 bg-card"
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
          >
            <div className="flex h-full flex-col">
              <div className="flex h-16 items-center justify-between border-b border-border/40 px-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-5 w-5 text-primary-foreground"
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
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 space-y-1 p-4">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      item.active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </motion.aside>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search grievances..."
                  className="w-64 rounded-xl border border-border bg-secondary/50 py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                className="relative rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
              </button>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Stats Grid */}
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading dashboard data…</p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = statIcons[index] ?? FileText
              return (
              <motion.div
                key={stat.label}
                className="rounded-2xl border border-border/50 bg-card/80 p-6 backdrop-blur-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`flex items-center gap-1 text-sm font-medium ${
                      stat.trend === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {stat.change}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </motion.div>
            )})}
          </div>

          {/* Charts and Map Row */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Chart Placeholder */}
            <motion.div
              className="rounded-2xl border border-border/50 bg-card/80 p-6 backdrop-blur-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Grievance Trends</h2>
                <button className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  Last 7 days
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
              <div className="h-64 rounded-xl border border-border/40 bg-secondary/20 p-2">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No trend data yet
                  </div>
                )}
              </div>
            </motion.div>

            {/* Map Placeholder */}
            <motion.div
              className="rounded-2xl border border-border/50 bg-card/80 p-6 backdrop-blur-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Geographic Distribution</h2>
                <button className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  All Regions
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
              {mapGrievances.some((g) => g.latitude != null) ? (
                <GrievanceMiniMap grievances={mapGrievances} />
              ) : (
                <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-secondary/30">
                  <p className="text-sm text-muted-foreground">No geotagged grievances yet</p>
                </div>
              )}
              {regionChart.length > 0 ? (
                <div className="mt-4 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={regionChart} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="region" width={80} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : null}
            </motion.div>
          </div>

          {/* Data Table */}
          <motion.div
            className="mt-6 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex flex-col items-start justify-between gap-4 border-b border-border/40 p-6 sm:flex-row sm:items-center">
              <h2 className="text-lg font-semibold text-foreground">Recent Grievances</h2>
              <div className="flex flex-wrap items-center gap-3">
                {/* Filter Dropdown */}
                <div className="relative">
                  <button className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <Filter className="h-4 w-4" />
                    {selectedFilter}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                {/* Status Filters */}
                <div className="flex items-center gap-2">
                  {["All", "Pending", "In Progress", "Resolved"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedFilter(filter)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        selectedFilter === filter
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => void exportCsv()}
                  className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
                <Link
                  href="/admin"
                  className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  Full console →
                </Link>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Priority
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {grievances.map((grievance) => (
                    <tr
                      key={grievance.id}
                      className="cursor-pointer transition-colors hover:bg-secondary/30"
                      onClick={() => router.push(`/grievances/${grievance.numericId}`)}
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="font-mono text-sm text-primary">
                          {grievance.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-foreground">
                          {grievance.title}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="text-sm text-muted-foreground">
                          {grievance.category}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                            statusColors[grievance.status]
                          }`}
                        >
                          {grievance.status === "Resolved" && (
                            <CheckCircle2 className="h-3 w-3" />
                          )}
                          {grievance.status === "Pending" && (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          {grievance.status === "In Progress" && (
                            <Clock className="h-3 w-3" />
                          )}
                          {grievance.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`text-sm font-medium ${
                            priorityColors[grievance.priority]
                          }`}
                        >
                          {grievance.priority}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          {grievance.location}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="text-sm text-muted-foreground">
                          {grievance.date}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-border/40 px-6 py-4">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{grievances.length}</span> of{" "}
                <span className="font-medium text-foreground">{total.toLocaleString()}</span> filtered (
                {allTotal.toLocaleString()} total)
              </p>
              <div className="flex items-center gap-2">
                <button className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50">
                  Previous
                </button>
                <button className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  Next
                </button>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
