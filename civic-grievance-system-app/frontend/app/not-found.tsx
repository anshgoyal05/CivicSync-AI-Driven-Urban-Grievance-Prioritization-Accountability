import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-semibold text-foreground">404</h1>
      <p className="mt-2 text-muted-foreground">This page could not be found.</p>
      <Link
        href="/"
        className="mt-6 rounded-2xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Back to home
      </Link>
    </div>
  );
}
