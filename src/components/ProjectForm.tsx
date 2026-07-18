"use client";

import { useState } from "react";
import type { Project } from "@prisma/client";
import { Button } from "@/components/Button";

const COMMITMENTS = ["FULL_TIME", "PART_TIME"] as const;

const INPUT_CLASSES =
  "border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";
const LABEL_CLASSES = "flex flex-col gap-1 text-sm font-medium text-gray-700";

interface ProjectFormProps {
  action: (formData: FormData) => void;
  initialProject?: Project | null;
}

export function ProjectForm({ action, initialProject }: ProjectFormProps) {
  const [rolesNeeded, setRolesNeeded] = useState(initialProject?.rolesNeeded.join(", ") ?? "");

  return (
    <form action={action} className="flex flex-col gap-4 max-w-lg">
      <label className={LABEL_CLASSES}>
        Name
        <input name="name" defaultValue={initialProject?.name ?? ""} required className={INPUT_CLASSES} />
      </label>
      <label className={LABEL_CLASSES}>
        Tagline
        <input name="tagline" defaultValue={initialProject?.tagline ?? ""} required className={INPUT_CLASSES} />
      </label>
      <label className={LABEL_CLASSES}>
        Description
        <textarea
          name="description"
          defaultValue={initialProject?.description ?? ""}
          required
          className={INPUT_CLASSES}
        />
      </label>
      <label className={LABEL_CLASSES}>
        Industry
        <input name="industry" defaultValue={initialProject?.industry ?? ""} className={INPUT_CLASSES} />
      </label>
      <label className={LABEL_CLASSES}>
        Roles needed (comma separated)
        <input
          name="rolesNeeded"
          value={rolesNeeded}
          onChange={(e) => setRolesNeeded(e.target.value)}
          className={INPUT_CLASSES}
        />
      </label>
      <label className={LABEL_CLASSES}>
        Equity offered
        <input name="equityOffered" defaultValue={initialProject?.equityOffered ?? ""} className={INPUT_CLASSES} />
      </label>
      <label className={LABEL_CLASSES}>
        Commitment expected
        <select
          name="commitmentExpected"
          defaultValue={initialProject?.commitmentExpected ?? ""}
          className={INPUT_CLASSES}
        >
          <option value="">Not specified</option>
          {COMMITMENTS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label className={LABEL_CLASSES}>
        Website URL
        <input name="websiteUrl" defaultValue={initialProject?.websiteUrl ?? ""} className={INPUT_CLASSES} />
      </label>
      <label className={LABEL_CLASSES}>
        Deck URL
        <input name="deckUrl" defaultValue={initialProject?.deckUrl ?? ""} className={INPUT_CLASSES} />
      </label>
      <label className={LABEL_CLASSES}>
        Demo URL
        <input name="demoUrl" defaultValue={initialProject?.demoUrl ?? ""} className={INPUT_CLASSES} />
      </label>
      <Button type="submit" className="self-start">
        Save
      </Button>
    </form>
  );
}
