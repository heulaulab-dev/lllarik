"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDashboardLogout, useDashboardMe } from "@/lib/dashboardService";

type Preferences = {
  denseDashboard: boolean;
  compactSidebar: boolean;
  showImagePreviews: boolean;
};

const defaultPreferences: Preferences = {
  denseDashboard: true,
  compactSidebar: false,
  showImagePreviews: true,
};

const storageKey = "dashboard:settings:preferences";

export default function DashboardSettingsPage() {
  const { data: me, isLoading: meLoading } = useDashboardMe();
  const logout = useDashboardLogout();

  const [displayName, setDisplayName] = useState("");
  const [preferences, setPreferences] = useState<Preferences>(() => {
    if (typeof window === "undefined") return defaultPreferences;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return defaultPreferences;
      const parsed = JSON.parse(raw) as Partial<Preferences>;
      return { ...defaultPreferences, ...parsed };
    } catch {
      return defaultPreferences;
    }
  });
  const [savedMessage, setSavedMessage] = useState("");
  const displayNameValue = useMemo(() => displayName || me?.name || "", [displayName, me?.name]);

  function togglePreference(key: keyof Preferences) {
    setPreferences((current) => ({ ...current, [key]: !current[key] }));
  }

  function savePreferences() {
    localStorage.setItem(storageKey, JSON.stringify(preferences));
    setSavedMessage("Preferences saved locally on this browser.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Manage your account identity and quick session actions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Email</p>
            <Input value={meLoading ? "Loading..." : me?.email ?? ""} readOnly />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Display name</p>
            <Input value={displayNameValue} onChange={(event) => setDisplayName(event.target.value)} placeholder="Your name" />
            <p className="text-xs text-muted-foreground">Display name changes are local-only for now.</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={() => setSavedMessage("Display name saved locally.")}>
              Save Profile
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={logout.isPending}
              onClick={() => {
                logout.mutate();
              }}
            >
              {logout.isPending ? "Signing out..." : "Sign out everywhere"}
            </Button>
          </div>
          {savedMessage ? <p className="text-xs text-muted-foreground">{savedMessage}</p> : null}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Dashboard Preferences</CardTitle>
          <CardDescription>Personalize how crowded and visual your dashboard feels.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            type="button"
            variant={preferences.denseDashboard ? "default" : "outline"}
            className="w-full justify-start"
            onClick={() => togglePreference("denseDashboard")}
          >
            Dense overview cards and charts
          </Button>
          <Button
            type="button"
            variant={preferences.compactSidebar ? "default" : "outline"}
            className="w-full justify-start"
            onClick={() => togglePreference("compactSidebar")}
          >
            Compact sidebar spacing
          </Button>
          <Button
            type="button"
            variant={preferences.showImagePreviews ? "default" : "outline"}
            className="w-full justify-start"
            onClick={() => togglePreference("showImagePreviews")}
          >
            Always show image previews in tables
          </Button>
          <Button type="button" className="w-full" onClick={savePreferences}>
            Save Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
