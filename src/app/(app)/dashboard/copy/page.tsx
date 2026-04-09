"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboardCopy } from "@/lib/dashboardService";

const copyOptions = [
  { key: "hero.estLine", label: "Hero - Established Line" },
  { key: "hero.nav.collection", label: "Hero Nav - Collection" },
  { key: "hero.nav.philosophy", label: "Hero Nav - Philosophy" },
  { key: "hero.nav.spaces", label: "Hero Nav - Spaces" },
  { key: "hero.nav.contact", label: "Hero Nav - Contact" },
  { key: "hero.headline.line1", label: "Hero Headline - Line 1" },
  { key: "hero.headline.line2", label: "Hero Headline - Line 2" },
  { key: "hero.headline.accent", label: "Hero Headline - Accent" },
  { key: "hero.body.primary", label: "Hero Body - Primary" },
  { key: "hero.body.secondary", label: "Hero Body - Secondary" },
  { key: "hero.cta.primary", label: "Hero CTA - Primary" },
  { key: "hero.cta.secondary", label: "Hero CTA - Secondary" },
  { key: "hero.image.badge", label: "Hero Image - Badge" },
  { key: "productShowcase.label", label: "Product Showcase - Label" },
  { key: "productShowcase.title.line1", label: "Product Showcase - Title Line 1" },
  { key: "productShowcase.title.line2", label: "Product Showcase - Title Line 2" },
  { key: "productShowcase.title.accent", label: "Product Showcase - Title Accent" },
  { key: "lookbook.label", label: "Lookbook - Label" },
  { key: "lookbook.heading.line1", label: "Lookbook - Heading Line 1" },
  { key: "lookbook.heading.accent", label: "Lookbook - Heading Accent" },
  { key: "lookbook.intro", label: "Lookbook - Intro" },
  { key: "lookbook.closingLine", label: "Lookbook - Closing Line" },
];

function getOptionLabel(optionKey: string) {
  if (!optionKey) return "No option selected";
  const found = copyOptions.find((item) => item.key === optionKey);
  return found?.label ?? `Custom Option (${optionKey})`;
}

export default function DashboardCopyPage() {
  const { copyItems, updateCopy } = useDashboardCopy();
  const [key, setKey] = useState("");
  const [group, setGroup] = useState("");
  const [value, setValue] = useState("");
  const isEditing = Boolean(key);
  let submitLabel = isEditing ? "Save Changes" : "Create Copy Draft";
  if (updateCopy.isPending) {
    submitLabel = "Saving...";
  }

  function clearForm() {
    setKey("");
    setGroup("");
    setValue("");
  }

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Draft Copy Blocks</CardTitle>
          <p className="text-sm text-muted-foreground">
            Click any row to load it into the form on the right for quick editing.
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Option</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Value Text</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {copyItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    No draft copy yet. Create your first one in the form.
                  </TableCell>
                </TableRow>
              ) : (
                copyItems.map((item) => (
                  <TableRow
                    key={item.key}
                    className="cursor-pointer"
                    onClick={() => {
                      setKey(item.key);
                      setGroup(item.group);
                      setValue(item.value);
                    }}
                  >
                    <TableCell>{getOptionLabel(item.key)}</TableCell>
                    <TableCell>{item.group}</TableCell>
                    <TableCell className="truncate max-w-64">{item.value}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Copy Draft" : "Create Copy Draft"}</CardTitle>
          <p className="text-sm text-muted-foreground">Fill Option first, then Value Text, then save.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-medium">1) Option</p>
            <Select
              value={key}
              onValueChange={(nextKey) => {
                if (!nextKey) return;
                setKey(nextKey);
                setGroup(nextKey.split(".")[0] ?? "");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose which text block to edit" />
              </SelectTrigger>
              <SelectContent>
                {copyOptions.map((option) => (
                  <SelectItem key={option.key} value={option.key}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">You only need to choose from the list. No manual key typing.</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">2) Value Text</p>
            <Textarea placeholder="Write the text shown to users..." value={value} onChange={(e) => setValue(e.target.value)} />
            <p className="text-xs text-muted-foreground">This text will appear on the website.</p>
          </div>
          <div className="rounded-md border bg-muted/40 p-3 space-y-1">
            <p className="text-xs text-muted-foreground">Preview</p>
            <p className="text-sm font-medium">{getOptionLabel(key)}</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{value.trim() || "Your text preview appears here."}</p>
          </div>
          <Button
            className="w-full"
            disabled={updateCopy.isPending || !key.trim() || !value.trim()}
            onClick={async () => {
              await updateCopy.mutateAsync({
                key: key.trim(),
                group: group.trim() || key.split(".")[0] || "general",
                value: value.trim(),
              });
            }}
          >
            {submitLabel}
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={clearForm}>
            Clear Form
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
