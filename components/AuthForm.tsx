"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { authClient } from "@/lib/auth/client";
import FormField from "./FormField";

const authFormSchema = (type: FormType) =>
  z.object({
    name: type === "sign-up" ? z.string().trim().min(2, "Enter your name") : z.string().optional(),
    email: z.string().trim().email("Enter a valid email"),
    password: z.string().min(8, "Use at least 8 characters"),
  });

const copy = {
  "sign-in": {
    title: "Welcome back",
    subtitle: "Sign in to pick up where you left off.",
    submit: "Sign in",
    pending: "Signing in",
    switchText: "New to HireonAI?",
    switchLink: { label: "Create an account", href: "/sign-up" },
  },
  "sign-up": {
    title: "Create your account",
    subtitle: "Start practicing interviews in under a minute.",
    submit: "Create account",
    pending: "Creating account",
    switchText: "Already have an account?",
    switchLink: { label: "Sign in", href: "/sign-in" },
  },
} as const;

/**
 * SOURCE OF TRUTH KEYWORDS: AuthForm, sign in form, sign up form, continue with google, email password, better auth
 * WHAT:  The sign-in / sign-up card: Google button (when configured) plus email and password.
 * WHY:   One form for both flows so validation, errors and styling stay identical. Sign-up
 *        signs the user straight in (Better Auth autoSignIn) and lands on the dashboard.
 * WHERE: app/(auth)/sign-in/page.tsx, app/(auth)/sign-up/page.tsx.
 */
const AuthForm = ({ type, googleEnabled }: { type: FormType; googleEnabled: boolean }) => {
  const router = useRouter();
  const formSchema = authFormSchema(type);
  const text = copy[type];
  const [googlePending, setGooglePending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "" },
  });
  const submitting = form.formState.isSubmitting;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { error } =
      type === "sign-up"
        ? await authClient.signUp.email({
            name: values.name ?? "",
            email: values.email,
            password: values.password,
          })
        : await authClient.signIn.email({ email: values.email, password: values.password });

    if (error) {
      toast.error(error.message ?? "Something went wrong. Please try again.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function continueWithGoogle() {
    setGooglePending(true);
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
    if (error) {
      setGooglePending(false);
      toast.error(error.message ?? "Google sign-in failed. Please try again.");
    }
  }

  return (
    <div className="card-border w-full max-w-md">
      <div className="card flex flex-col gap-6 px-6 py-10 sm:px-10">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-primary-100">{text.title}</h1>
          <p>{text.subtitle}</p>
        </div>

        {googleEnabled && (
          <>
            <button
              type="button"
              onClick={continueWithGoogle}
              disabled={googlePending || submitting}
              className="flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-primary-200/20 bg-dark-200 px-5 font-semibold text-primary-100 transition-colors hover:border-primary-200/40 hover:bg-dark-300 disabled:opacity-60"
            >
              <Image src="/google.svg" alt="" width={20} height={20} />
              {googlePending ? "Redirecting to Google" : "Continue with Google"}
            </button>

            <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-light-400">
              <span className="h-px flex-1 bg-primary-200/10" />
              or
              <span className="h-px flex-1 bg-primary-200/10" />
            </div>
          </>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="form w-full space-y-5" noValidate>
            {type === "sign-up" && (
              <FormField control={form.control} name="name" label="Name" placeholder="Your name" />
            )}
            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="you@example.com"
              type="email"
            />
            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder={type === "sign-up" ? "At least 8 characters" : "Your password"}
              type="password"
            />

            <Button type="submit" className="btn" disabled={submitting || googlePending}>
              {submitting ? text.pending : text.submit}
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm">
          {text.switchText}
          <Link href={text.switchLink.href} className="ml-1 font-semibold text-primary-200 hover:underline">
            {text.switchLink.label}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
