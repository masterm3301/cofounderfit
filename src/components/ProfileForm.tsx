"use client";

import { useState } from "react";
import type { Profile } from "@prisma/client";
import { Button } from "@/components/Button";

const ROLE_TYPES = ["TECHNICAL", "BUSINESS", "DESIGN", "OTHER"] as const;
const COMMITMENTS = ["FULL_TIME", "PART_TIME"] as const;

const INPUT_CLASSES =
  "border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";
const LABEL_CLASSES = "flex flex-col gap-1 text-sm font-medium text-gray-700";

interface ProfileFormProps {
  action: (formData: FormData) => void;
  initialProfile?: Profile | null;
}

export function ProfileForm({ action, initialProfile }: ProfileFormProps) {
  const [skills, setSkills] = useState(initialProfile?.skills.join(", ") ?? "");
  const [otherLinks, setOtherLinks] = useState(initialProfile?.otherLinks.join(", ") ?? "");

  return (
    <form action={action} className="flex flex-col gap-4 max-w-lg">
      <label className={LABEL_CLASSES}>
        Bio
        <textarea name="bio" defaultValue={initialProfile?.bio ?? ""} required className={INPUT_CLASSES} />
      </label>
      <label className={LABEL_CLASSES}>
        Skills (comma separated)
        <input
          name="skills"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          required
          className={INPUT_CLASSES}
        />
      </label>
      <label className={LABEL_CLASSES}>
        Role
        <select name="roleType" defaultValue={initialProfile?.roleType ?? ""} required className={INPUT_CLASSES}>
          <option value="" disabled>
            Select a role
          </option>
          {ROLE_TYPES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>
      <label className={LABEL_CLASSES}>
        Commitment
        <select name="commitment" defaultValue={initialProfile?.commitment ?? ""} required className={INPUT_CLASSES}>
          <option value="" disabled>
            Select commitment
          </option>
          {COMMITMENTS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <input type="checkbox" name="hasIdea" defaultChecked={initialProfile?.hasIdea ?? false} />
        I already have an idea
      </label>
      <label className={LABEL_CLASSES}>
        Location
        <input name="location" defaultValue={initialProfile?.location ?? ""} className={INPUT_CLASSES} />
      </label>
      <label className={LABEL_CLASSES}>
        What I want in a co-founder
        <textarea
          name="coFounderTraitsWanted"
          defaultValue={initialProfile?.coFounderTraitsWanted ?? ""}
          className={INPUT_CLASSES}
        />
      </label>
      <label className={LABEL_CLASSES}>
        Other links (comma separated URLs)
        <input
          name="otherLinks"
          value={otherLinks}
          onChange={(e) => setOtherLinks(e.target.value)}
          className={INPUT_CLASSES}
        />
      </label>
      <Button type="submit" className="self-start">
        Save
      </Button>
    </form>
  );
}
