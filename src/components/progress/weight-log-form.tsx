"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Scale } from "lucide-react";
import { weightEntrySchema, type WeightEntryInput } from "@/lib/validations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/language-context";

interface WeightLogFormProps {
  today: string;
  onLog: (weightKg: number, date: string, notes?: string) => Promise<void>;
}

export function WeightLogForm({ today, onLog }: WeightLogFormProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WeightEntryInput>({
    resolver: zodResolver(weightEntrySchema),
    defaultValues: { date: today },
  });

  const onSubmit = async (data: WeightEntryInput) => {
    setLoading(true);
    try {
      await onLog(data.weightKg, data.date, data.notes);
      reset({ date: today });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          {t("progress.logWeight")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="weightKg">{t("progress.weightKg")}</Label>
            <Input
              id="weightKg"
              type="number"
              step="0.1"
              placeholder={t("progress.weightPlaceholder")}
              {...register("weightKg")}
            />
            {errors.weightKg && (
              <p className="text-xs text-destructive">{errors.weightKg.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="date">{t("progress.date")}</Label>
            <Input
              id="date"
              type="date"
              max={today}
              {...register("date")}
            />
            {errors.date && (
              <p className="text-xs text-destructive">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">{t("progress.notes")}</Label>
            <Input
              id="notes"
              placeholder={t("progress.notesPlaceholder")}
              {...register("notes")}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("progress.saving")}
              </>
            ) : (
              t("progress.saveWeight")
            )}
          </Button>
        </form>

        <div className="mt-5 p-3 rounded-lg bg-muted/20 border border-border space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{t("progress.trackingTipsTitle")}</p>
          <ul className="text-xs text-muted-foreground/70 space-y-0.5 list-disc list-inside">
            <li>{t("progress.tip1")}</li>
            <li>{t("progress.tip2")}</li>
            <li>{t("progress.tip3")}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
