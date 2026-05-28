"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "./theme-toggle"
import { LogOut, Menu, PlusCircle, Shield, X } from "lucide-react"
import { useState } from "react"

import { useAuth } from "@/lib/auth"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  const close = () => setIsOpen(false)

  const handleLogout = () => {
    logout()
    close()
    router.push("/")
  }

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2" onClick={close}>
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
          <span className="text-xl font-semibold tracking-tight text-foreground">
            CivicSync
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>
          {user ? (
            <>
              <Link
                href="/submit"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Submit
              </Link>
              <Link
                href="/grievances"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                My Grievances
              </Link>
              {user.role === "admin" ? (
                <Link
                  href="/admin"
                  className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Shield className="h-3.5 w-3.5" />
                  Admin
                </Link>
              ) : null}
            </>
          ) : (
            <Link
              href="/#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </Link>
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {loading ? null : user ? (
            <>
              <span className="max-w-[160px] truncate text-xs text-muted-foreground">
                {user.name}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
              {user.role === "admin" ? (
                <Link
                  href="/admin"
                  className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Console
                </Link>
              ) : (
                <Link
                  href="/submit"
                  className="flex items-center gap-1.5 rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <PlusCircle className="h-4 w-4" />
                  New grievance
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-2xl px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
              >
                Log in
              </Link>
              <Link
                href="/login?next=/submit"
                className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-foreground"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {isOpen ? (
        <motion.div
          className="border-t border-border/40 bg-background/95 backdrop-blur-xl md:hidden"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          <div className="flex flex-col gap-2 px-6 py-4">
            <Link href="/" className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-secondary" onClick={close}>
              Home
            </Link>
            {user ? (
              <>
                <Link href="/submit" className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-secondary" onClick={close}>
                  Submit grievance
                </Link>
                <Link href="/grievances" className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-secondary" onClick={close}>
                  My grievances
                </Link>
                {user.role === "admin" ? (
                  <Link href="/admin" className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-secondary" onClick={close}>
                    Admin console
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl px-4 py-3 text-left text-sm font-medium text-muted-foreground hover:bg-secondary"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/#features" className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-secondary" onClick={close}>
                  Features
                </Link>
                <Link href="/login" className="rounded-xl px-4 py-3 text-center text-sm font-medium hover:bg-secondary" onClick={close}>
                  Log in
                </Link>
                <Link
                  href="/login?next=/submit"
                  className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground"
                  onClick={close}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </motion.div>
      ) : null}
    </motion.header>
  )
}
