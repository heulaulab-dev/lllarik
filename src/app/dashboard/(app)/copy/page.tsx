"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDashboardCopy } from "@/lib/dashboardService";

export default function DashboardCopyPage() {
  const { copyItems, updateCopy } = useDashboardCopy();
  const [key, setKey] = useState("");
  const [group, setGroup] = useState("");
  const [value, setValue] = useState("");

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Draft Copy Blocks</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {copyItems.map((item) => (
                <TableRow
                  key={item.key}
                  className="cursor-pointer"
                  onClick={() => {
                    setKey(item.key);
                    setGroup(item.group);
                    setValue(item.value);
                  }}
                >
                  <TableCell>{item.key}</TableCell>
                  <TableCell>{item.group}</TableCell>
                  <TableCell className="truncate max-w-64">{item.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Upsert Copy Draft</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Key (e.g. hero.headline.line1)" value={key} onChange={(e) => setKey(e.target.value)} />
          <Input placeholder="Group (e.g. hero)" value={group} onChange={(e) => setGroup(e.target.value)} />
          <Textarea placeholder="Value" value={value} onChange={(e) => setValue(e.target.value)} />
          <Button
            className="w-full"
            disabled={updateCopy.isPending || !key}
            onClick={async () => {
              await updateCopy.mutateAsync({ key, group, value });
            }}
          >
            Save Copy Draft
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
