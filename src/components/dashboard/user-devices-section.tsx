"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Laptop,
  Loader2,
  MonitorSmartphone,
  Smartphone,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  formatRelativeTime,
  MAX_USER_DEVICES,
  type UserDeviceRow,
} from "@/lib/auth/devices";

type DevicesResponse = {
  devices: UserDeviceRow[];
  currentDeviceToken: string | null;
};

function DeviceIcon({ name }: { name: string }) {
  const lower = name.toLowerCase();
  if (lower.includes("ios") || lower.includes("android")) {
    return <Smartphone className="h-4 w-4 shrink-0 text-[#64748B]" />;
  }
  if (
    lower.includes("macos") ||
    lower.includes("windows") ||
    lower.includes("linux")
  ) {
    return <Laptop className="h-4 w-4 shrink-0 text-[#64748B]" />;
  }
  return <MonitorSmartphone className="h-4 w-4 shrink-0 text-[#64748B]" />;
}

export function UserDevicesSection() {
  const router = useRouter();
  const [devices, setDevices] = useState<UserDeviceRow[]>([]);
  const [currentDeviceToken, setCurrentDeviceToken] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadDevices = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/profile/devices");
      if (!res.ok) {
        throw new Error("Could not load devices");
      }
      const data = (await res.json()) as DevicesResponse;
      setDevices(data.devices);
      setCurrentDeviceToken(data.currentDeviceToken);
    } catch {
      setError("Could not load your devices. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDevices();
  }, [loadDevices]);

  const handleRemove = async (deviceId: string) => {
    setRemovingId(deviceId);
    setError(null);

    try {
      const res = await fetch("/api/profile/devices", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        removedCurrentDevice?: boolean;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error ?? "Could not remove device");
      }

      if (data.removedCurrentDevice) {
        router.push("/auth?signin");
        router.refresh();
        return;
      }

      await loadDevices();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove device");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Card className="mt-4 p-6">
      <h2 className="font-semibold">Signed-in devices</h2>
      <p className="mt-1 text-sm text-[#64748B]">
        You can stay signed in on up to {MAX_USER_DEVICES} devices. Remove one
        to sign in on a new device.
      </p>

      {error && <p className="mt-3 text-sm text-[#B91C1C]">{error}</p>}

      <div className="mt-4 space-y-2">
        {loading ? (
          <div className="flex items-center gap-2 rounded-lg border border-[#E5E0D8] px-4 py-3 text-sm text-[#64748B]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading devices...
          </div>
        ) : devices.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#E5E0D8] px-4 py-3 text-sm text-[#64748B]">
            No devices registered yet. Your current browser will appear here
            after your next sign-in.
          </div>
        ) : (
          devices.map((device) => {
            const isCurrent = device.device_token === currentDeviceToken;
            return (
              <div
                key={device.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-[#E5E0D8] px-4 py-3"
              >
                <div className="min-w-0 flex items-start gap-3">
                  <div className="mt-0.5">
                    <DeviceIcon name={device.device_name} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-[#1F2A37]">
                        {device.device_name}
                      </span>
                      {isCurrent && (
                        <span className="rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[11px] font-semibold text-[#4338CA]">
                          This device
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-[#64748B]">
                      Last active {formatRelativeTime(device.last_seen_at)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="shrink-0 gap-1.5"
                  disabled={removingId === device.id}
                  onClick={() => void handleRemove(device.id)}
                >
                  {removingId === device.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Remove
                </Button>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
