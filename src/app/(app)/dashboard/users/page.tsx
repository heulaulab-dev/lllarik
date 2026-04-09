"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function DashboardUsersPage() {
  const router = useRouter();
  const { data: me, isLoading: meLoading } = useDashboardMe();
  const { users, isLoading, createAdmin, setActive } = useDashboardUsers();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Add admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="email"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <Input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 8 characters)"
          />
          <Button
            className="w-full"
            disabled={createAdmin.isPending}
            onClick={async () => {
              await createAdmin.mutateAsync({ email: email.trim(), password });
              setEmail("");
              setPassword("");
            }}
          >
            {createAdmin.isPending ? "Creating…" : "Create admin"}
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
                  <TableHead>Email</TableHead>
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
                      <TableCell className="font-medium">{u.email}</TableCell>
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
