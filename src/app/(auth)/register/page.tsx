"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";

export default function RegisterPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email.toLowerCase(),
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: t("auth.register.registrationFailed"),
          description: result.error || t("common.tryAgain"),
          variant: "destructive",
        });
        return;
      }

      // Auto sign in after registration
      const signInResult = await signIn("credentials", {
        email: data.email.toLowerCase(),
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error || !signInResult?.ok) {
        toast({
          title: t("auth.register.accountCreated"),
          description: t("auth.login.subtitle"),
        });
        window.location.href = "/login";
        return;
      }

      // Full page navigation after registration to pick up JWT cookie
      window.location.href = "/onboarding";
    } catch {
      toast({
        title: t("common.somethingWentWrong"),
        description: t("common.tryAgain"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">{t("auth.register.title")}</h1>
        <p className="text-muted-foreground">
          {t("auth.register.subtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="name">{t("auth.register.fullName")}</Label>
          <Input
            id="name"
            type="text"
            placeholder={t("auth.register.namePlaceholder")}
            autoComplete="name"
            disabled={isLoading}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">{t("auth.register.email")}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t("auth.register.emailPlaceholder")}
            autoComplete="email"
            disabled={isLoading}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">{t("auth.register.password")}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("auth.register.passwordPlaceholder")}
              autoComplete="new-password"
              disabled={isLoading}
              className="pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">{t("auth.register.confirmPassword")}</Label>
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder={t("auth.register.confirmPasswordPlaceholder")}
            autoComplete="new-password"
            disabled={isLoading}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          {t("auth.register.termsText")}{" "}
          <span className="text-brand-600 dark:text-brand-400 cursor-pointer hover:underline">{t("auth.register.termsLink")}</span>{" "}
          {t("auth.register.andText")}{" "}
          <span className="text-brand-600 dark:text-brand-400 cursor-pointer hover:underline">{t("auth.register.privacyLink")}</span>.
        </p>

        <Button
          type="submit"
          className="w-full py-5 font-semibold glow-green"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              {t("auth.register.creatingAccount")}
            </>
          ) : (
            t("auth.register.createAccount")
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        {t("auth.register.alreadyHaveAccount")}{" "}
        <Link
          href="/login"
          className="text-brand-600 dark:text-brand-400 hover:text-brand-500 font-medium transition-colors"
        >
          {t("auth.register.signIn")}
        </Link>
      </p>
    </div>
  );
}
