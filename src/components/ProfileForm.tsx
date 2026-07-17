"use client";

import { useState } from "react";
import type { Profile } from "@prisma/client";

const ROLE_TYPES = ["TECHNICAL", "BUSINESS", "DESIGN", "OTHER"] as const;
const COMMITMENTS = ["FULL_TIME", "PART_TIME"] as const;

interface ProfileFormProps {
  action: (formData: FormData) => void;
  initialProfile?: Profile | null;
}

export function ProfileForm({ action, initialProfile }: ProfileFormProps) {
  const [skills, setSkills] = useState(initialProfile?.skills.join(", ") ?? "");
  const [otherLinks, setOtherLinks] = useState(initialProfile?.otherLinks.join(", ") ?? "");

  return (
    <form action={action} className="flex flex-col gap-4 max-w-lg">
      <label className="flex flex-col gap-1">
        Bio
        <textarea name="bio" defaultValue={initialProfile?.bio ?? ""} required className="border p-2" />
      </label>
      <label className="flex flex-col gap-1">
        Skills (comma separated)
        <input name="skills" value={skills} onChange={(e) => setSkills(e.target.value)} required className="border p-2" />
      </label>
      <label className="flex flex-col gap-1">
        Role
        <select name="roleType" defaultValue={initialProfile?.roleType ?? ""} required className="border p-2">
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
      <label className="flex flex-col gap-1">
        Commitment
        <select name="commitment" defaultValue={initialProfile?.commitment ?? ""} required className="border p-2">
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
      <label className="flex items-center gap-2">
        <input type="checkbox" name="hasIdea" defaultChecked={initialProfile?.hasIdea ?? false} />
        I already have an idea
      </label>
      <label className="flex flex-col gap-1">
        Location
        <input name="location" defaultValue={initialProfile?.location ?? ""} className="border p-2" />
      </label>
      <label className="flex flex-col gap-1">
        What I want in a co-founder
        <textarea name="coFounderTraitsWanted" defaultValue={initialProfile?.coFounderTraitsWanted ?? ""} className="border p-2" />
      </label>
      <label className="flex flex-col gap-1">
        Other links (comma separated URLs)
        <input name="otherLinks" value={otherLinks} onChange={(e) => setOtherLinks(e.target.value)} className="border p-2" />
      </label>
      <button type="submit" className="bg-black text-white p-2 rounded">
        Save
      </button>
    </form>
  );
}
