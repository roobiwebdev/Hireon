"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const authFormSchema = (type: FormType) => {
  const base = {
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .min(6, "Email must be at least 6 characters")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .trim()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
  };

  if (type === "sign-up") {
    return z.object({
      name: z
        .string()
        .trim()
        .min(1, "Name is required")
        .min(3, "Name must be at least 3 characters"),
      ...base,
    });
  }

  return z.object({
    name: z.string().optional(),
    ...base,
  });
};

// Previous/basic schema (uses Zod default messages like "String must contain at least X character(s)")
const legacyAuthFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(4) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(6),
  });
};

// Toggle which schema to use without changing call sites
const USE_LEGACY_SCHEMA = false;

const AuthForm = ({ type }: { type: FormType }) => {
  const formSchema = USE_LEGACY_SCHEMA
    ? legacyAuthFormSchema(type)
    : authFormSchema(type);
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // 2. Define a submit handler.
  const router = useRouter();
  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (type === "sign-up") {
        toast.success("Sign Up successfully please Sign In");
        router.push("/sign-in");
        console.log("Sign Up", values);
      } else {
        toast.success("Sign In successfully");
        router.push("/");
        console.log("Sign In", values);
      }
    } catch (error) {
      console.log(error);
      toast.error("There was an error");
    }
  }

  const isSignIn = type === "sign-in";

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="Logo" height={32} width={38} />
          <h2 className="text-primary-100">Hireon</h2>
        </div>

        <h3 className="text-center">Practice job interview with AI</h3>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="label">Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your name"
                        {...field}
                        className="input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="label">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                      className="input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="label">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      {...field}
                      className="input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="btn">
              {isSignIn ? "Sign in" : "Create an Account"}
            </Button>
          </form>
        </Form>

        <p className="text-center">
          {isSignIn ? "No account yet?" : "Have an account already?"}
          <Link
            href={isSignIn ? "/sign-up" : "/sign-in"}
            className="font-bold text-user-primary ml-1"
          >
            {isSignIn ? "Sign up" : "Sign in"}
          </Link>
        </p>
      </div>
    </div>
  );
};
export default AuthForm;
