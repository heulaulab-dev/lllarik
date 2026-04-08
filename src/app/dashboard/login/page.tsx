"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDashboardLogin } from "@/lib/dashboardService";
import { useDashboardAuthStore } from "@/lib/dashboardStore";

export default function DashboardLoginPage() {
  const router = useRouter();
  const token = useDashboardAuthStore((s) => s.token);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useDashboardLogin();

  useEffect(() => {
    if (token) {
      router.replace("/dashboard/overview");
    }
  }, [token, router]);

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Dashboard Login</CardTitle>
          <CardDescription>Sign in using your CMS admin/editor account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            className="w-full"
            onClick={async () => {
              await login.mutateAsync({ email, password });
              router.push("/dashboard/overview");
            }}
            disabled={login.isPending}
          >
            {login.isPending ? "Signing in..." : "Sign in"}
          </Button>
          {login.isError ? (
            <p className="text-sm text-destructive">Login failed. Check your credentials.</p>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
