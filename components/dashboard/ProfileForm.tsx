"use client";

import { useState } from "react";

interface ProfileFormProps {
  initialProfile: {
    email: string;
    firstName: string;
    lastName: string;
    company: string;
    jobTitle: string;
    phone: string;
    timezone: string;
    locale: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    marketingOptIn: boolean;
  };
  canEditName: boolean;
}

export function ProfileForm({ initialProfile, canEditName }: ProfileFormProps) {
  const [form, setForm] = useState(initialProfile);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save profile");
      }

      const data = await res.json();
      setForm((prev) => ({ ...prev, ...data }));
      setSaved(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-gray-600">First name</label>
          <input
            type="text"
            value={form.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
            placeholder="Alex"
          />
          <p className="mt-1 text-[11px] text-gray-500">
            Required to subscribe to a paid plan.
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Last name</label>
          <input
            type="text"
            value={form.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
            placeholder="Rodriguez"
          />
          <p className="mt-1 text-[11px] text-gray-500">
            Required to subscribe to a paid plan.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-gray-600">Company</label>
          <input
            type="text"
            value={form.company}
            onChange={(e) => updateField("company", e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            placeholder="Acme Inc."
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Job title</label>
          <input
            type="text"
            value={form.jobTitle}
            onChange={(e) => updateField("jobTitle", e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            placeholder="Founder / Marketing lead"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-gray-600">Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            placeholder="+1 (555) 000-0000"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Timezone</label>
          <input
            type="text"
            value={form.timezone}
            onChange={(e) => updateField("timezone", e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            placeholder="America/New_York"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-gray-600">Locale</label>
          <input
            type="text"
            value={form.locale}
            onChange={(e) => updateField("locale", e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            placeholder="en-US"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Country</label>
          <input
            type="text"
            value={form.country}
            onChange={(e) => updateField("country", e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            placeholder="United States"
          />
          <p className="mt-1 text-[11px] text-gray-500">
            Required to subscribe to a paid plan.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600">Address</label>
        <input
          type="text"
          value={form.addressLine1}
          onChange={(e) => updateField("addressLine1", e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          placeholder="Street address"
        />
        <p className="mt-1 text-[11px] text-gray-500">
          Required to subscribe to a paid plan.
        </p>
        <input
          type="text"
          value={form.addressLine2}
          onChange={(e) => updateField("addressLine2", e.target.value)}
          className="mt-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          placeholder="Apt, suite, unit (optional)"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-gray-600">City</label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => updateField("city", e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
          <p className="mt-1 text-[11px] text-gray-500">
            Required to subscribe to a paid plan.
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">State / Region</label>
          <input
            type="text"
            value={form.state}
            onChange={(e) => updateField("state", e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
          <p className="mt-1 text-[11px] text-gray-500">
            Required to subscribe to a paid plan.
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Postal code</label>
          <input
            type="text"
            value={form.postalCode}
            onChange={(e) => updateField("postalCode", e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
          <p className="mt-1 text-[11px] text-gray-500">
            Required to subscribe to a paid plan.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <input
          id="marketingOptIn"
          type="checkbox"
          checked={form.marketingOptIn}
          onChange={(e) => updateField("marketingOptIn", e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
        />
        <label htmlFor="marketingOptIn" className="text-xs text-gray-600">
          Send me product updates and compliance tips.
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-900 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save profile"}
        </button>
        {saved && !error && (
          <p className="text-xs text-emerald-600">Profile updated.</p>
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </form>
  );
}
