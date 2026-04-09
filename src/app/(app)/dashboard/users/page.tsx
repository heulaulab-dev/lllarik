"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { z } from "zod";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const Roles = ["admin", "editor", "viewer"] as const;
const createUserSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters."),
    email: z.string().trim().email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
    role: z.enum(Roles),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export default function DashboardUsersPage() {
  const router = useRouter();
  const { data: me, isLoading: meLoading } = useDashboardMe();
  const { users, isLoading, createAdmin, setActive } = useDashboardUsers();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<(typeof Roles)[number]>("admin");
  const [submittedOnce, setSubmittedOnce] = useState(false);

  const nameTrim = name.trim();
  const emailTrim = email.trim();
  const validation = useMemo(() => {
    const result = createUserSchema.safeParse({
      name: nameTrim,
      email: emailTrim,
      password,
      confirmPassword,
      role,
    });

    const fieldErrors = result.success ? {} : result.error.flatten().fieldErrors;
    const messages = submittedOnce
      ? Object.values(fieldErrors)
          .flat()
          .filter(Boolean)
      : [];

    return {
      canSubmit: result.success,
      fieldErrors,
      messages,
    };
  }, [nameTrim, emailTrim, password, confirmPassword, role, submittedOnce]);

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
                aria-invalid={submittedOnce && !!validation.fieldErrors?.name?.[0]}
                className={cn(submittedOnce && !!validation.fieldErrors?.name?.[0] && "border-destructive")}
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
                placeholder="name@yourcompany.com"
                aria-invalid={submittedOnce && !!validation.fieldErrors?.email?.[0]}
                className={cn(submittedOnce && !!validation.fieldErrors?.email?.[0] && "border-destructive")}
              />
              <p className="text-[11px] text-muted-foreground">Used as their login username; must be unique.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Role</label>
              <Select value={role} onValueChange={(value) => setRole(value as (typeof Roles)[number])}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Roles</SelectLabel>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">Controls access based on RBAC.</p>
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
                placeholder="At least 8 characters"
                aria-invalid={submittedOnce && !!validation.fieldErrors?.password?.[0]}
                className={cn(submittedOnce && !!validation.fieldErrors?.password?.[0] && "border-destructive")}
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
                placeholder="Re-enter password"
                aria-invalid={submittedOnce && !!validation.fieldErrors?.confirmPassword?.[0]}
                className={cn(submittedOnce && !!validation.fieldErrors?.confirmPassword?.[0] && "border-destructive")}
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
              setSubmittedOnce(true);
              if (!validation.canSubmit) return;
              await createAdmin.mutateAsync({ name: nameTrim, email: emailTrim, password, role });
              setName("");
              setEmail("");
              setPassword("");
              setConfirmPassword("");
              setRole("admin");
              setSubmittedOnce(false);
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
