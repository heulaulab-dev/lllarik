"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDashboardMe, useDashboardUsers } from "@/lib/dashboardService";
import { cn } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function DashboardUsersPage() {
  const router = useRouter();
  const { data: me, isLoading: meLoading } = useDashboardMe();
  const { users, isLoading, createAdmin, setActive } = useDashboardUsers();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false, confirm: false });

  const nameTrim = name.trim();
  const emailTrim = email.trim();
  const validation = useMemo(() => {
    const nameOk = nameTrim.length > 1;
    const emailOk = EMAIL_RE.test(emailTrim);
    const pwdLen = password.length;
    const pwdOk = pwdLen >= 8;
    const matchOk = password.length > 0 && password === confirmPassword;
    const messages: string[] = [];
    if (nameTrim.length > 0 && !nameOk) {
      messages.push("Name must be at least 2 characters.");
    }
    if (touched.email && emailTrim.length > 0 && !emailOk) {
      messages.push("Enter a valid email address.");
    }
    if (touched.password && password.length > 0 && !pwdOk) {
      messages.push("Password must be at least 8 characters.");
    }
    if (touched.confirm && confirmPassword.length > 0 && !matchOk) {
      messages.push("Passwords do not match.");
    }
    const canSubmit = nameOk && emailOk && pwdOk && matchOk;
    return { nameOk, emailOk, pwdOk, matchOk, canSubmit, messages };
  }, [nameTrim, emailTrim, password, confirmPassword, touched]);

  if (meLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (me?.role !== "admin") {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">You need an admin account to manage users.</p>
        <Button type="button" variant="outline" size="sm" onClick={() => router.push("/dashboard/overview")}>
          Back to overview
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-2 border-border/80 shadow-sm">
        <CardHeader className="space-y-1.5">
          <CardTitle>Create admin account</CardTitle>
          <CardDescription>
            Adds a new colleague with full access: publishing, user management, and all editor capabilities.
            They sign in with this email and password using the normal dashboard login.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <fieldset className="space-y-4 border-0 p-0">
            <legend className="sr-only">New admin credentials</legend>
            <div className="space-y-2">
              <label htmlFor="new-admin-name" className="text-sm font-medium text-foreground">
                Full name
              </label>
              <Input
                id="new-admin-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aisyah Putri"
                aria-invalid={nameTrim.length > 0 && !validation.nameOk}
                className={cn(nameTrim.length > 0 && !validation.nameOk && "border-destructive")}
              />
              <p className="text-[11px] text-muted-foreground">Shown in the dashboard header and account menu.</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="new-admin-email" className="text-sm font-medium text-foreground">
                Work email
              </label>
              <Input
                id="new-admin-email"
                type="email"
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                placeholder="name@yourcompany.com"
                aria-invalid={touched.email && emailTrim.length > 0 && !validation.emailOk}
                className={cn(
                  touched.email && emailTrim.length > 0 && !validation.emailOk && "border-destructive",
                )}
              />
              <p className="text-[11px] text-muted-foreground">Used as their login username; must be unique.</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="new-admin-password" className="text-sm font-medium text-foreground">
                Initial password
              </label>
              <Input
                id="new-admin-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                placeholder="At least 8 characters"
                aria-invalid={touched.password && password.length > 0 && !validation.pwdOk}
                className={cn(
                  touched.password && password.length > 0 && !validation.pwdOk && "border-destructive",
                )}
              />
              <p className="text-[11px] text-muted-foreground">
                Share this securely with the new admin; they can continue using it until you rotate credentials.
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="new-admin-confirm" className="text-sm font-medium text-foreground">
                Confirm password
              </label>
              <Input
                id="new-admin-confirm"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
                placeholder="Re-enter password"
                aria-invalid={touched.confirm && confirmPassword.length > 0 && !validation.matchOk}
                className={cn(
                  touched.confirm && confirmPassword.length > 0 && !validation.matchOk && "border-destructive",
                )}
              />
            </div>
          </fieldset>
          {validation.messages.length > 0 ? (
            <ul className="text-sm text-destructive space-y-0.5 list-disc pl-4">
              {validation.messages.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          ) : null}
          <Button
            className="w-full"
            disabled={createAdmin.isPending || !validation.canSubmit}
            onClick={async () => {
              setTouched({ email: true, password: true, confirm: true });
              if (!validation.canSubmit) return;
              await createAdmin.mutateAsync({ name: nameTrim, email: emailTrim, password });
              setName("");
              setEmail("");
              setPassword("");
              setConfirmPassword("");
              setTouched({ email: false, password: false, confirm: false });
            }}
          >
            {createAdmin.isPending ? "Creating…" : "Create admin account"}
          </Button>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>All users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading users…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => {
                  const isSelf = me?.userId === u.id;
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        <div className="min-w-0">
                          <div className="truncate">{u.name}</div>
                          <div className="truncate text-xs text-muted-foreground">{u.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{u.role}</TableCell>
                      <TableCell>{u.isActive ? "Active" : "Inactive"}</TableCell>
                      <TableCell className="text-right">
                        {u.isActive ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={setActive.isPending || isSelf}
                            onClick={() => setActive.mutate({ id: u.id, isActive: false })}
                          >
                            Deactivate
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={setActive.isPending}
                            onClick={() => setActive.mutate({ id: u.id, isActive: true })}
                          >
                            Activate
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
