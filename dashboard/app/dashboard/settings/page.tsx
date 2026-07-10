"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [services, setServices] = useState("");
  const [calendlyLink, setCalendlyLink] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName,
          company_website: companyWebsite,
          services_offered: services.split(",").map((s) => s.trim()).filter(Boolean),
          calendly_link: calendlyLink,
        }),
      });
    } catch {}
    setSaving(false);
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="font-display text-2xl text-paper-100 mb-6">Settings</h1>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-xl border border-line bg-ink-900 p-6 space-y-4">
          <h2 className="font-display text-lg text-paper-100">Company Profile</h2>

          <div>
            <label className="block text-sm text-paper-300 mb-1.5">Company name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Your agency name"
              className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500"
            />
          </div>

          <div>
            <label className="block text-sm text-paper-300 mb-1.5">Your website</label>
            <input
              type="text"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              placeholder="yoursite.com"
              className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500"
            />
          </div>

          <div>
            <label className="block text-sm text-paper-300 mb-1.5">Services offered (comma separated)</label>
            <input
              type="text"
              value={services}
              onChange={(e) => setServices(e.target.value)}
              placeholder="web development, SEO, logo design"
              className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500"
            />
          </div>

          <div>
            <label className="block text-sm text-paper-300 mb-1.5">Calendly link (optional)</label>
            <input
              type="text"
              value={calendlyLink}
              onChange={(e) => setCalendlyLink(e.target.value)}
              placeholder="https://calendly.com/yourname"
              className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-flash-500 text-ink-950 font-medium px-5 py-2.5 text-sm hover:bg-flash-400 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>

      <div className="mt-8 rounded-xl border border-line bg-ink-900 p-6">
        <h2 className="font-display text-lg text-paper-100 mb-3">API Keys</h2>
        <p className="text-sm text-paper-400 mb-4">
          Add your own API keys for AI providers. All keys are stored securely and used only by your worker.
        </p>
        <div className="space-y-3">
          {["Cohere API Key", "Gemini API Key", "OpenRouter API Key", "Resend API Key"].map((provider) => (
            <div key={provider}>
              <label className="block text-sm text-paper-300 mb-1.5">{provider}</label>
              <input
                type="password"
                placeholder={`Enter your ${provider}`}
                className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
