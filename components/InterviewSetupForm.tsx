"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField as ShadcnFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createInterview } from "@/lib/actions/interview.action";
import { cn } from "@/lib/utils";
import { interviewLevels, interviewSetupSchema, interviewTypes } from "@/lib/validation/interview";
import FormField from "./FormField";

type SetupValues = z.input<typeof interviewSetupSchema>;

const QUESTION_COUNTS = [3, 5, 8, 10] as const;

function ChoiceGroup({
  options,
  value,
  onChange,
}: {
  options: ReadonlyArray<string | number>;
  value: string | number | undefined;
  onChange: (value: string | number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup">
      {options.map((option) => {
        const selected = String(value) === String(option);
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-colors",
              selected
                ? "border-primary-200 bg-primary-200 font-semibold text-dark-100"
                : "border-primary-200/20 bg-dark-200 text-light-100 hover:border-primary-200/50"
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

/**
 * SOURCE OF TRUTH KEYWORDS: InterviewSetupForm, new interview form, interview setup, role level type stack, create interview ui
 * WHAT:  The form that sets up a new interview, then opens it so the call can start.
 * WHY:   Replaces the paid Vapi voice workflow for setup; Gemini writes the questions server side.
 * WHERE: app/(root)/interview/page.tsx (browser voice mode).
 */
export default function InterviewSetupForm() {
  const router = useRouter();
  const form = useForm<SetupValues>({
    resolver: zodResolver(interviewSetupSchema),
    defaultValues: { role: "", level: "Junior", type: "Technical", techstack: "", amount: 5 },
  });
  const submitting = form.formState.isSubmitting;

  async function onSubmit(values: SetupValues) {
    const result = await createInterview(values);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Your interview is ready.");
    router.push(`/interview/${result.id}`);
  }

  return (
    <div className="card-border w-full">
      <div className="card flex flex-col gap-6 px-6 py-8 sm:px-10">
        <div className="flex flex-col gap-2">
          <h3 className="text-primary-100">Set up your interview</h3>
          <p>Tell us the job you are practicing for. We&apos;ll write the questions, then the interviewer calls you.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="form flex flex-col gap-6" noValidate>
            <FormField control={form.control} name="role" label="Job title" placeholder="e.g. Frontend Developer" />

            <ShadcnFormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="label">Level</FormLabel>
                  <FormControl>
                    <ChoiceGroup options={interviewLevels} value={field.value} onChange={(v) => field.onChange(String(v))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ShadcnFormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="label">Focus</FormLabel>
                  <FormControl>
                    <ChoiceGroup options={interviewTypes} value={field.value} onChange={(v) => field.onChange(String(v))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="techstack"
              label="Tech stack (comma separated)"
              placeholder="e.g. React, TypeScript, Next.js"
            />

            <ShadcnFormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="label">Number of questions</FormLabel>
                  <FormControl>
                    <ChoiceGroup
                      options={QUESTION_COUNTS}
                      value={typeof field.value === "number" || typeof field.value === "string" ? field.value : undefined}
                      onChange={(v) => field.onChange(Number(v))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="btn" disabled={submitting}>
              {submitting ? "Writing your questions" : "Create interview"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
