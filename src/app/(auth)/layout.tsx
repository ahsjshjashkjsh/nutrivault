import Link from "next/link";
import { Leaf } from "lucide-react";
import { APP_NAME } from "@/constants";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />

        <Link href="/" className="relative flex items-center gap-2.5 z-10">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl">{APP_NAME}</span>
        </Link>

        <div className="relative z-10 max-w-sm">
          <blockquote className="space-y-4">
            <p className="text-2xl font-semibold leading-relaxed text-foreground">
              &ldquo;The most powerful nutrition tool I&apos;ve used. Tracking my macros has never felt this clean.&rdquo;
            </p>
            <footer className="text-sm text-muted-foreground">
              <div className="font-medium text-foreground">Alex M.</div>
              <div>Lost 18 kg in 6 months</div>
            </footer>
          </blockquote>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { value: "50k+", label: "Users" },
            { value: "2M+", label: "Meals logged" },
            { value: "4.9", label: "Rating" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-3 rounded-xl bg-card/50 border border-border/50">
              <p className="text-xl font-bold text-brand-600 dark:text-brand-400">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 xl:px-20">
        <div className="lg:hidden mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl">{APP_NAME}</span>
          </Link>
        </div>
        <div className="w-full max-w-md mx-auto lg:mx-0">
          {children}
        </div>
      </div>
    </div>
  );
}
