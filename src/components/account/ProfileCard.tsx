"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.email("Enter a valid email address"),
});

type Values = z.infer<typeof schema>;

export function ProfileCard({ name, username, email }: Values) {
  const router = useRouter();
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name, username, email },
  });

  const submit = async (values: Values) => {
    setStatus(null);

    const operations: Promise<{ error?: { message?: string } | null }>[] = [];
    if (values.name !== name || values.username !== username) {
      operations.push(authClient.updateUser({ name: values.name, username: values.username }));
    }
    if (values.email !== email) {
      operations.push(authClient.changeEmail({ newEmail: values.email, callbackURL: "/account" }));
    }

    if (operations.length === 0) {
      setStatus({ ok: true, message: "No changes to save." });
      return;
    }

    const failed = (await Promise.all(operations)).find((result) => result.error);
    if (failed) {
      setStatus({ ok: false, message: failed.error?.message ?? "Something went wrong." });
      return;
    }

    setStatus({ ok: true, message: "Profile updated." });
    form.reset(values);
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Your name, username, and email address.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)} className="flex flex-col gap-6">
          <CardContent className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {status ? (
              <p
                className={cn("text-sm", status.ok ? "text-muted-foreground" : "text-destructive")}
              >
                {status.message}
              </p>
            ) : null}
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Save changes
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
