"use client";

import { useState } from "react";
import type { Project } from "@prisma/client";

const COMMITMENTS = ["FULL_TIME", "PART_TIME"] as const;

interface ProjectFormProps {
  action: (formData: FormData) => void;
  initialProject?: Project | null;
}

export function ProjectForm({ action, initialProject }: ProjectFormProps) {
  const [rolesNeeded, setRolesNeeded] = useState(initialProject?.rolesNeeded.join(", ") ?? "");

  return (
    <form action={action} className="flex flex-col gap-4 max-w-lg">
      <label className="flex flex-col gap-1">
        Name
        <input name="name" defaultValue={initialProject?.name ?? ""} required className="border p-2" />
      </label>
      <label className="flex flex-col gap-1">
        Tagline
        <input name="tagline" defaultValue={initialProject?.tagline ?? ""} required className="border p-2" />
      </label>
      <label className="flex flex-col gap-1">
        Description
        <textarea name="description" defaultValue={initialProject?.description ?? ""} required className="border p-2" />
      </label>
      <label className="flex flex-col gap-1">
        Industry
        <input name="industry" defaultValue={initialProject?.industry ?? ""} className="border p-2" />
      </label>
      <label className="flex flex-col gap-1">
        Roles needed (comma separated)
        <input
          name="rolesNeeded"
          value={rolesNeeded}
          onChange={(e) => setRolesNeeded(e.target.value)}
          className="border p-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        Equity offered
        <input name="equityOffered" defaultValue={initialProject?.equityOffered ?? ""} className="border p-2" />
      </label>
      <label className="flex flex-col gap-1">
        Commitment expected
        <select name="commitmentExpected" defaultValue={initialProject?.commitmentExpected ?? ""} className="border p-2">
          <option value="">Not specified</option>
          {COMMITMENTS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        Website URL
        <input name="websiteUrl" defaultValue={initialProject?.websiteUrl ?? ""} className="border p-2" />
      </label>
      <label className="flex flex-col gap-1">
        Deck URL
        <input name="deckUrl" defaultValue={initialProject?.deckUrl ?? ""} className="border p-2" />
      </label>
      <label className="flex flex-col gap-1">
        Demo URL
        <input name="demoUrl" defaultValue={initialProject?.demoUrl ?? ""} className="border p-2" />
      </label>
      <button type="submit" className="bg-black text-white p-2 rounded">
        Save
      </button>
    </form>
  );
}
