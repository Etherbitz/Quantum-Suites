"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

type ComplianceAlert = {
  id: string;
  previousScore: number;
  currentScore: number;
  delta: number;
  severity: "warning" | "critical";
  acknowledged: boolean;
  createdAt: string;
};

export function AlertBell() {
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [open, setOpen] = useState(false);

  const unreadCount = alerts.filter(a => !a.acknowledged).length;

  useEffect(() => {
    fetch("/api/alerts")
      .then(res => res.json())
      .then(data => setAlerts(data.alerts));
  }, []);

  async function acknowledge(id: string) {
    await fetch(`/api/alerts/${id}/acknowledge`, { method: "POST" });
    setAlerts(alerts =>
      alerts.map(a =>
        a.id === id ? { ...a, acknowledged: true } : a
      )
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative rounded-full p-2 hover:bg-neutral-800"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-neutral-800 bg-neutral-950 shadow-lg z-50">
          <div className="p-3 text-sm font-semibold border-b border-neutral-800">
            Alerts
          </div>

          {alerts.length === 0 ? (
            <div className="p-4 text-sm text-neutral-400">
              No alerts
            </div>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {alerts.map(alert => (
                <li
                  key={alert.id}
                  className={`p-3 border-b border-neutral-800 ${
                    alert.acknowledged ? "opacity-60" : ""
                  }`}
                >
                  <div className="text-sm">
                    Compliance score dropped{" "}
                    <span className="font-semibold text-red-400">
                      {alert.delta}%
                    </span>
                  </div>

                  <div className="text-xs text-neutral-400">
                    {new Date(alert.createdAt).toLocaleString()}
                  </div>

                  {!alert.acknowledged && (
                    <button
                      onClick={() => acknowledge(alert.id)}
                      className="mt-2 text-xs text-blue-400 hover:underline"
                    >
                      Mark as read
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
